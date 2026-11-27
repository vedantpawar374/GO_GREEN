import { useEffect, useRef, useState } from "react";
import { emissionFactors } from "../data/emissionFactors";
import { calculateCarbonSaved } from "../utils/calculateCarbonSaved";
import { submitActivity } from "../services/activityService";

function CarbonCalculator({ onActivitySubmitted }) {
    const [distance, setDistance] = useState("");
    const [usedTransport, setUsedTransport] = useState("walking");
    const [alternativeTransport, setAlternativeTransport] = useState("car");
    const [result, setResult] = useState(null);
    const [error, setError] = useState("");
    const [description, setDescription] = useState("");
    const [proofImage, setProofImage] = useState(null);
    const [imagePreview, setImagePreview] = useState("");
    const [proofAddedAt, setProofAddedAt] = useState(null);
    const [imageDimensionsValid, setImageDimensionsValid] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const [location, setLocation] = useState("");
    const [isLocating, setIsLocating] = useState(false);
    const [locationStatus, setLocationStatus] = useState("");
    const imageValidationId = useRef(0);
    const fileInputRef = useRef(null);

    const transportOptions = Object.keys(emissionFactors);
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    const maximumSize = 5 * 1024 * 1024;

    useEffect(() => {
        if (!imagePreview) return undefined;
        return () => URL.revokeObjectURL(imagePreview);
    }, [imagePreview]);

    const handleProofFile = (selectedFile) => {
        const validationId = ++imageValidationId.current;
        setImageDimensionsValid(null);

        if (!selectedFile) {
            setProofImage(null);
            setImagePreview("");
            setProofAddedAt(null);
            return;
        }

        if (!allowedTypes.includes(selectedFile.type)) {
            setError("Please select a JPG, PNG, or WEBP image");
            setProofImage(null);
            setImagePreview("");
            setProofAddedAt(null);
            return;
        }

        if (selectedFile.size >= maximumSize) {
            setError("Image size must be less than 5MB");
            setProofImage(null);
            setImagePreview("");
            setProofAddedAt(null);
            return;
        }

        setError("");
        setProofImage(selectedFile);
        setProofAddedAt(new Date());
        const previewUrl = URL.createObjectURL(selectedFile);
        setImagePreview(previewUrl);

        const image = new Image();
        image.onload = () => {
            if (validationId === imageValidationId.current) {
                setImageDimensionsValid(
                    image.naturalWidth > 0 && image.naturalHeight > 0,
                );
            }
        };
        image.onerror = () => {
            if (validationId === imageValidationId.current) {
                setImageDimensionsValid(false);
            }
        };
        image.src = previewUrl;
    };

    const handleImageChange = (event) => {
        const selectedFile = event.target.files?.[0];
        event.target.value = "";
        handleProofFile(selectedFile);
    };

    const handleDetectLocation = () => {
        if (typeof navigator === "undefined" || !navigator.geolocation) {
            setLocationStatus(
                "Location is unavailable in this browser — you can type your area manually",
            );
            return;
        }

        setIsLocating(true);
        setLocationStatus("Requesting your location...");
        navigator.geolocation.getCurrentPosition(
            async ({ coords }) => {
                const { latitude, longitude } = coords;
                const coordinateFallback =
                    `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
                const controller = new AbortController();
                const timeoutId = window.setTimeout(
                    () => controller.abort(),
                    8000,
                );

                try {
                    const response = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
                        { signal: controller.signal },
                    );
                    if (!response.ok) {
                        throw new Error("Unable to resolve the location");
                    }

                    const data = await response.json();
                    const address = data.address || {};
                    const areaParts = [
                        address.suburb ||
                            address.village ||
                            address.town ||
                            address.neighbourhood,
                        address.city ||
                            address.county ||
                            address.municipality,
                        address.state,
                    ]
                        .filter(Boolean)
                        .map((part) => String(part).trim())
                        .filter(Boolean);
                    const areaLabel = [...new Set(areaParts)]
                        .slice(0, 3)
                        .join(", ")
                        .slice(0, 200);

                    if (!areaLabel) {
                        throw new Error("No area label was returned");
                    }

                    setLocation(areaLabel);
                    setLocationStatus("Location detected with OpenStreetMap.");
                } catch {
                    setLocation(coordinateFallback);
                    setLocationStatus(
                        "Area lookup unavailable; approximate coordinates added.",
                    );
                } finally {
                    window.clearTimeout(timeoutId);
                    setIsLocating(false);
                }
            },
            (geolocationError) => {
                setIsLocating(false);
                if (geolocationError.code === 1) {
                    setLocationStatus(
                        "Location permission denied — you can type your area manually",
                    );
                } else if (geolocationError.code === 2) {
                    setLocationStatus(
                        "Location is unavailable — you can type your area manually",
                    );
                } else {
                    setLocationStatus(
                        "Location request timed out — you can type your area manually",
                    );
                }
            },
            { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 },
        );
    };

    const handleProofDrop = (event) => {
        event.preventDefault();
        setIsDragging(false);
        const droppedFile = event.dataTransfer.files?.[0];
        if (droppedFile) handleProofFile(droppedFile);
    };

    const handleProofDragLeave = (event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
            setIsDragging(false);
        }
    };

    const openFilePicker = () => {
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
            fileInputRef.current.click();
        }
    };

    const removeProof = () => {
        imageValidationId.current += 1;
        setProofImage(null);
        setImagePreview("");
        setProofAddedAt(null);
        setImageDimensionsValid(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleActivitySubmit = async () => {
        setError("");
        setSuccessMessage("");
        if (!result) {
            setError("Calculate the carbon saving before submitting");
            return;
        }
        if (!proofImage) {
            setError("please upload a proof image");
            return;
        }
        const activityData = {
            description: description.trim(),
            distance: Number(distance),
            usedTransport,
            alternativeTransport,
            proofImage,
            location: location.trim(),
        };
        try {
            setIsSubmitting(true);
            const response = await submitActivity(activityData);
            setSuccessMessage(response.message);
            console.log("saved activity", response.activity);
            setDistance("");
            setDescription("");
            setProofImage(null);
            setImagePreview("");
            setProofAddedAt(null);
            setImageDimensionsValid(null);
            imageValidationId.current += 1;
            setResult(null);
            setLocation("");
            setLocationStatus("");
            onActivitySubmitted?.();
        } catch (error) {
            setError(error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCalculate = (event) => {
        event.preventDefault();
        setError("");
        setSuccessMessage("");
        setResult(null);
        if (!description.trim()) {
            setError("Please describe your eco-friendly activity");
            return;
        }
        if (!distance || Number(distance) <= 0) {
            setError("Distance must be greater than zero");
            return;
        }
        if (usedTransport === alternativeTransport) {
            setError("Transport used and transport avoided must be different");
            return;
        }
        try {
            const carbonSaved = calculateCarbonSaved(
                distance,
                usedTransport,
                alternativeTransport,
            );
            if (carbonSaved <= 0) {
                setError(
                    "This activity does not produce positive carbon savings",
                );
                return;
            }
            setResult({
                carbonSaved,
                greenPoints: Math.round(carbonSaved * 100),
            });
        } catch (error) {
            setError(error.message);
        }
    };

    const formatFileSize = (bytes) =>
        bytes >= 1024 * 1024
            ? `${(bytes / (1024 * 1024)).toFixed(2)} MB`
            : `${(bytes / 1024).toFixed(1)} KB`;

    const preChecks = [
        {
            label: "Valid Format",
            passed: proofImage ? allowedTypes.includes(proofImage.type) : null,
        },
        {
            label: "Size < 5MB",
            passed: proofImage ? proofImage.size < maximumSize : null,
        },
        {
            label: "Valid Image Dimensions",
            passed: imageDimensionsValid,
        },
        {
            label: "Positive CO₂ Savings",
            passed: result ? result.carbonSaved > 0 : null,
        },
        {
            label: "Location Tagged",
            passed: location.trim() ? true : null,
        },
    ];
    const isProofValid = Boolean(
        proofImage &&
        allowedTypes.includes(proofImage.type) &&
        proofImage.size < maximumSize,
    );

    return (
        <div className="carbon-calculator">
            <div className="calculator-top-grid">
                <form
                    className="calculator-form calculator-form-card"
                    onSubmit={handleCalculate}
                >
                    <div className="transport-fields">
                        <div className="calculator-field">
                            <label htmlFor="usedTransport">
                                Transport you used
                            </label>
                            <select
                                id="usedTransport"
                                value={usedTransport}
                                onChange={(event) =>
                                    setUsedTransport(event.target.value)
                                }
                            >
                                {transportOptions.map((transport) => (
                                    <option key={transport} value={transport}>
                                        {transport}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="calculator-field">
                            <label htmlFor="alternativeTransport">
                                Transport you avoided
                            </label>
                            <select
                                id="alternativeTransport"
                                value={alternativeTransport}
                                onChange={(event) =>
                                    setAlternativeTransport(event.target.value)
                                }
                            >
                                {transportOptions.map((transport) => (
                                    <option key={transport} value={transport}>
                                        {transport}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="calculator-field">
                            <label htmlFor="distance">
                                Distance traveled in km
                            </label>
                            <input
                                id="distance"
                                type="number"
                                min="0"
                                step="0.1"
                                value={distance}
                                onChange={(event) =>
                                    setDistance(event.target.value)
                                }
                                placeholder="Distance"
                            />
                        </div>
                    </div>

                    <div className="calculator-field">
                        <label htmlFor="description">
                            Describe your eco-friendly activity
                        </label>
                        <textarea
                            id="description"
                            value={description}
                            onChange={(event) =>
                                setDescription(event.target.value)
                            }
                            placeholder="Example: I traveled 20 km by train instead of car"
                            rows="3"
                        />
                    </div>

                    <div className="calculator-field location-field">
                        <label htmlFor="activityLocation">
                            Activity Location (Where)
                        </label>
                        <div className="activity-location-controls">
                            <input
                                id="activityLocation"
                                type="text"
                                maxLength="200"
                                value={location}
                                onChange={(event) => {
                                    setLocation(event.target.value);
                                    setLocationStatus("");
                                }}
                                placeholder="e.g., Warananagar, Kolhapur (or click Detect)"
                            />
                            <button
                                type="button"
                                className="detect-location-button"
                                onClick={handleDetectLocation}
                                disabled={isLocating}
                            >
                                {isLocating
                                    ? "Locating..."
                                    : "📍 Detect Location"}
                            </button>
                        </div>
                        {locationStatus && (
                            <p className="location-status" role="status">
                                {locationStatus}
                            </p>
                        )}
                        <a
                            className="location-attribution"
                            href="https://www.openstreetmap.org/copyright"
                            target="_blank"
                            rel="noreferrer"
                        >
                            © OpenStreetMap contributors
                        </a>
                    </div>

                    <div className="calculator-field">
                        <label htmlFor="proofImage">Upload Proof</label>
                        <div
                            className={`proof-dropzone${isDragging ? " is-dragging" : ""}`}
                            onDragOver={(event) => {
                                event.preventDefault();
                                setIsDragging(true);
                            }}
                            onDragLeave={handleProofDragLeave}
                            onDrop={handleProofDrop}
                        >
                            <input
                                ref={fileInputRef}
                                id="proofImage"
                                className="proof-file-input"
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                onChange={handleImageChange}
                                aria-label="Upload proof image"
                            />
                            <label
                                className="proof-dropzone-label"
                                htmlFor="proofImage"
                            >
                                {proofImage ? (
                                    <span className="proof-dropzone-selected">
                                        <span className="proof-upload-icon" aria-hidden="true">
                                            ✓
                                        </span>
                                        <strong>{proofImage.name}</strong>
                                        <span>
                                            {formatFileSize(proofImage.size)} ·
                                            Click to browse or drop a replacement
                                        </span>
                                    </span>
                                ) : (
                                    <span className="proof-dropzone-prompt">
                                        <span className="proof-upload-icon" aria-hidden="true">
                                            ↑
                                        </span>
                                        <strong>
                                            Drag &amp; drop proof image here, or
                                            click to browse
                                        </strong>
                                        <span>
                                            JPG, PNG, WEBP up to 5MB
                                        </span>
                                    </span>
                                )}
                            </label>
                            {proofImage && (
                                <div className="proof-dropzone-actions">
                                    <button
                                        type="button"
                                        className="proof-dropzone-action"
                                        onClick={openFilePicker}
                                    >
                                        Change
                                    </button>
                                    <button
                                        type="button"
                                        className="proof-dropzone-action is-remove"
                                        onClick={removeProof}
                                    >
                                        Remove
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    <button className="calculator-submit-button" type="submit">
                        Calculate Carbon Saved
                    </button>
                </form>

                <section className="calculator-info-card formula-card">
                    <div className="calculator-card-heading">
                        <p className="calculator-eyebrow">Live estimate</p>
                        <h3>Carbon Formula &amp; Emission Factors</h3>
                    </div>

                    <p className="carbon-formula">
                        CO₂ Saved = (EF_Avoided − EF_Used) × Distance
                    </p>

                    <div className="emission-comparison">
                        <div>
                            <span>Avoided · {alternativeTransport}</span>
                            <strong>
                                {emissionFactors[alternativeTransport].toFixed(3)}
                                <small> kg CO₂/km</small>
                            </strong>
                        </div>
                        <span className="formula-minus">−</span>
                        <div>
                            <span>Used · {usedTransport}</span>
                            <strong>
                                {emissionFactors[usedTransport].toFixed(3)}
                                <small> kg CO₂/km</small>
                            </strong>
                        </div>
                    </div>

                    <div className="emission-factor-grid" aria-label="Emission factors">
                        {Object.entries(emissionFactors).map(
                            ([transport, factor]) => (
                                <div className="emission-factor" key={transport}>
                                    <span>{transport}</span>
                                    <strong>{factor.toFixed(3)}</strong>
                                </div>
                            ),
                        )}
                    </div>

                    <div className={`calculation-result${result ? " is-ready" : ""}`}>
                        {result ? (
                            <>
                                <div>
                                    <span>Net CO₂ Saved</span>
                                    <strong>
                                        {result.carbonSaved.toFixed(2)}
                                        <small> kg CO₂</small>
                                    </strong>
                                </div>
                                <div>
                                    <span>Estimated Green Points</span>
                                    <strong>{result.greenPoints}</strong>
                                </div>
                            </>
                        ) : (
                            <p>
                                Complete the activity form to see your estimated
                                savings and points.
                            </p>
                        )}
                    </div>
                </section>
            </div>

            <section className="calculator-info-card verification-wide-card">
                <div className="calculator-card-heading">
                    <p className="calculator-eyebrow">Proof &amp; review</p>
                    <h3>Proof Preview &amp; Verification</h3>
                </div>

                <div className="verification-wide-content">
                    <div className="verification-proof-side">
                        {proofImage && imagePreview ? (
                            <div className="proof-selected">
                                <img
                                    src={imagePreview}
                                    alt="Activity proof preview"
                                    className="proof-preview"
                                />
                                <div className="proof-file-details">
                                    <strong>{proofImage.name}</strong>
                                    <span>{formatFileSize(proofImage.size)}</span>
                                </div>
                                <div className="proof-context-meta">
                                    <span>
                                        📅{" "}
                                        {proofAddedAt
                                            ? proofAddedAt.toLocaleString(
                                                  "en-IN",
                                                  {
                                                      day: "2-digit",
                                                      month: "short",
                                                      year: "numeric",
                                                      hour: "2-digit",
                                                      minute: "2-digit",
                                                  },
                                              )
                                            : "Just added"}
                                    </span>
                                    <span className="location-capture-badge">
                                        📍 {location.trim() || "Location not recorded"}
                                    </span>
                                </div>
                            </div>
                        ) : (
                            <div className="proof-guidelines">
                                <h4>Valid Proof Guidelines</h4>
                                <ul>
                                    <li>Clear transit ticket or activity photo</li>
                                    <li>JPG, PNG, or WebP format</li>
                                    <li>Maximum file size: 5 MB</li>
                                </ul>
                            </div>
                        )}
                    </div>

                    <div className="verification-pipeline">
                        <div className="verification-step">
                            <div className="verification-step-heading">
                                <h4>1. Client Pre-Checks</h4>
                                <span className="pipeline-badge is-live">Live</span>
                            </div>
                            <ul className="precheck-list">
                                {preChecks.map(({ label, passed }) => (
                                    <li
                                        className={
                                            passed === true
                                                ? "is-passed"
                                                : passed === false
                                                  ? "needs-attention"
                                                  : "is-pending"
                                        }
                                        key={label}
                                    >
                                        <span aria-hidden="true">
                                            {passed === true
                                                ? "✓"
                                                : passed === false
                                                  ? "!"
                                                  : "○"}
                                        </span>
                                        {label}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="verification-step">
                            <div className="verification-step-heading">
                                <h4>2. AI/ML Vision Screening</h4>
                                <span className="pipeline-badge is-planned">
                                    Phase 2 • Planned
                                </span>
                            </div>
                            <p className="pipeline-note">
                                Automated MobileNetV3 proof verification &amp;
                                confidence routing will activate in Phase 2.
                                Currently routed to Admin Queue.
                            </p>
                        </div>

                        <div className="verification-step admin-review-step">
                            <div className="verification-step-heading">
                                <h4>3. Admin Approval</h4>
                                <span className="pipeline-badge is-active">
                                    Active
                                </span>
                            </div>
                            <p className="pipeline-note">
                                Points are credited after Admin review.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="submit-action-bar">
                    <p className="submit-status" role="status">
                        {result && isProofValid
                            ? `Ready to submit: ${result.carbonSaved.toFixed(2)} kg CO₂ saved • ${result.greenPoints} estimated Green Points`
                            : "Calculate carbon savings and attach valid proof to enable submission."}
                    </p>
                    {error && (
                        <p className="calculator-message error-message" role="alert">
                            {error}
                        </p>
                    )}
                    {successMessage && (
                        <p className="calculator-message success-message" role="status">
                            {successMessage}
                        </p>
                    )}
                    <button
                        type="button"
                        className="activity-verification-submit"
                        onClick={handleActivitySubmit}
                        disabled={!result || !isProofValid || isSubmitting}
                    >
                        {isSubmitting
                            ? "Submitting..."
                            : "Submit Activity for Verification"}
                    </button>
                </div>
            </section>
        </div>
    );
}

export default CarbonCalculator;
