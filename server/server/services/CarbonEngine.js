const emissionFactors = {
    walking:0,
     bicycle:0,
     car:0.192,
     train:0.041,
     bus:0.089,
     bike:0.103,
}

//in this function we have to calculate the carbonResult and return the calculated
//carbon saved

export function calculateCarbonResult({
    distance,
    usedTransport,
    alternativeTransport,
}){
    const numericDistance=Number(distance);
    if(!Number.isFinite(numericDistance) || numericDistance <=0)
    {
        throw new Error("Distance must be greater than zero");
    }
    const usedEmissionFactor=emissionFactors[usedTransport];
    const alternativeEmissionFactor=emissionFactors[alternativeTransport];
    if(usedEmissionFactor==undefined || alternativeEmissionFactor==undefined)
    {
        throw new Error("Invalid Transport type");
    }
    if(usedTransport==alternativeTransport)
    {
        throw new Error("Used Transport should not be equal to alternative trasnport");
    }
    const carbonSaved=(alternativeEmissionFactor-usedEmissionFactor)*numericDistance;
    if(carbonSaved<=0)
    {
        throw new Error("This activity doesn't produce positive carbon saving...")
    }
    
    const roundedCarbonSaved=Number(carbonSaved.toFixed(2));
    const pointsEarned=Math.round(roundedCarbonSaved *100);

    return{
        carbonSaved:roundedCarbonSaved,
        pointsEarned,
    };
}