import { emissionFactors } from "../data/emissionFactors";
export function calculateCarbonSaved(
    distance,
    usedTransport,
    alternativeTransport
)
{
    const numericDistance=Number(distance);
    if(!numericDistance || numericDistance<=0){
        throw new Error("Distance must be greater than zero");
    }
    const usedEmission=emissionFactors[usedTransport];
    const alternativeEmission=emissionFactors[alternativeTransport];
    if(usedEmission=== undefined || alternativeEmission === undefined) {
        throw new Error("Invalid transport type selected");
    }
    const carbonSaved=
    (alternativeEmission-usedEmission) * numericDistance;
    return Math.max(0,carbonSaved);
}