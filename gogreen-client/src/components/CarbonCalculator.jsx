import { useState } from "react";
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
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");

    const transportOptions = [
        "walking",
        "bicycle",
        "train",
        "bus",
        "bike",
        "car",
    ];
    const handleImageChange = (event) => {
        const selectedFile = event.target.files[0];
        if (!selectedFile) {
            setProofImage(null);
            setImagePreview("");
            return;
        }
        const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
        if (!allowedTypes.includes(selectedFile.type)) {
            setError("Please select a JPG, PNG, or WEBP image");
            setProofImage(null);
            setImagePreview("");
            return;
        }
        const maximumSize = 5 * 1024 * 1024;
        if (selectedFile.size > maximumSize) {
            setError("Image size must be less than 5MB");
            setProofImage(null);
            setImagePreview("");
            return;
        }
        setError("");
        setProofImage(selectedFile);
        setImagePreview(URL.createObjectURL(selectedFile));
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
        };
        try {
            setIsSubmitting(true);
            const response = await submitActivity(activityData);
            setSuccessMessage(response.message);
            console.log("saved activity", response.activity);
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
    return (
        <div>
            <h1>Carbon Footprint Calculator</h1>
            <form onSubmit={handleCalculate}>
                <div>
                    <label htmlFor="distance">Distance traveled in km</label>
                    <input
                        id="distance"
                        type="number"
                        min="0"
                        step="0.1"
                        value={distance}
                        onChange={(event) => setDistance(event.target.value)}
                        placeholder="Enter distance travelled"
                    />
                </div>
                <div>
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

                <div>
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
                    <div>
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
                            rows="4"
                        />
                    </div>
                    <div>
                        <label htmlFor="proofImage">Upload Proof</label>
                        <input
                            id="proofImage"
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            onChange={handleImageChange}
                        />
                    </div>
                    {imagePreview && (
                        <div>
                            <p>Selected Proof:</p>
                            <img
                                src={imagePreview}
                                alt="Activity proof preview"
                                className="proof-preview"
                            />
                        </div>
                    )}
                </div>
                <button type="submit">Calculate Carbon Saved</button>
            </form>
            {error && <p className="error-message">{error}</p>}
            {result && (
                <div>
                    <h2>Calculation Result</h2>
                    <p>
                        Carbon Saved:
                        <strong>
                            {" "}
                            {result.carbonSaved.toFixed(2)} kg of CO2
                        </strong>
                    </p>
                    <p>
                        Estimated Green Points:
                        <strong>{result.greenPoints}</strong>
                    </p>
                    <button
                        type="button"
                        onClick={handleActivitySubmit}
                        disabled={isSubmitting}
                    >
                        {isSubmitting
                            ? "Submitting..."
                            : "Submit Activity for Verification"}
                    </button>
                </div>
            )}
        </div>
    );
}
export default CarbonCalculator;
