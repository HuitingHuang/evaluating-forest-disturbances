// =====================================================================
// Parameters
// =====================================================================
var startDate = "2002-06-01";
var endDate = "2002-08-31";
var dateInFileName = "2002_06-08";

var vegIndex = "EVI"; //NDVI, NDMI, EVI
var compositeStrategy = "Max"; //"Max", "Mean", "Median"
var aoiPolygon = "TNC_AOIs_North_WGS84";  //TNC_AOIs_South_WGS84, TNC_AOIs_North_WGS84

var dataL5 = "LANDSAT/LT05/C02/T1_L2"; // USGS Landsat 5 Level 2, Collection 2, Tier 1
var dataL7 = "LANDSAT/LE07/C02/T1_L2"; // USGS Landsat 7 Level 2, Collection 2, Tier 1
var dataL8 = "LANDSAT/LC08/C02/T1_L2"; // USGS Landsat 8 Level 2, Collection 2, Tier 1
var dataset = dataL5;

// L5/7: B1=Blue, B3=Red, B4=NIR, B5=SWIR
// L8:B2=Blue, B4=Red, B5=NIR, B6=SWIR
  var blueBand, redBand, NIRBand, SWIRBand;
  if(dataset == dataL5 || dataset == dataL7) {
    blueBand = 'SR_B1';
    redBand = 'SR_B3';
    NIRBand = 'SR_B4';
    SWIRBand = 'SR_B5';
  } else if(dataset == dataL8) {
    blueBand = 'SR_B2';
    redBand = 'SR_B4';
    NIRBand = 'SR_B5';
    SWIRBand = 'SR_B6';
  }


// =====================================================================
// Helpers
// =====================================================================

//Cloud maksing
// QA_PIXEL Bit Index
// QA_RADSAT Bit Index
// Doc: https://www.usgs.gov/landsat-missions/landsat-collection-2-quality-assessment-bands
function maskL457sr(image) {
  // Only mask out:
  // Bit 0 - Fill
  // Bit 1 - Dilated Cloud
  // Bit 2 - Unused
  // Bit 3 - Cloud
  // Bit 4 - Cloud Shadow
  // Bit 5 - Snow
  // Bit 6 - Clear
  // Bit 7 - Water
  // Bit 8-9 - Cloud Confidence
  // Bit 10-11 - Cloud Shadow Confidence
  // Bit 12-13 - Snow/Ice Confidence
  // Bit 14-15 - Unused
  
  var qaMask = image.select('QA_PIXEL').bitwiseAnd(parseInt('11111', 2)).eq(0);
  var waterMask = image.select('QA_PIXEL').bitwiseAnd(1 << 7).eq(0);  
  var snowMask = image.select('QA_PIXEL').bitwiseAnd(1 << 5).eq(0);
  var cloudConf = image.select('QA_PIXEL').rightShift(8).bitwiseAnd(3).lt(2);
  var shadowConf = image.select('QA_PIXEL').rightShift(10).bitwiseAnd(3).lt(2);
  var snowConf = image.select('QA_PIXEL').rightShift(12).bitwiseAnd(3).lt(2);
  var saturationMask = image.select('QA_RADSAT').eq(0);

  // Apply the scaling factors to the appropriate bands.
  var opticalBands = image.select('SR_B.').multiply(0.0000275).add(-0.2);

  // Replace the original bands with the scaled ones and apply the masks.
  return image.addBands(opticalBands, null, true)
      .updateMask(qaMask)
      .updateMask(waterMask)
      .updateMask(snowMask)
      .updateMask(cloudConf)
      .updateMask(shadowConf)
      .updateMask(snowConf)
      .updateMask(saturationMask);
}

function maskL8sr(image) {
  // Bit 0 - Fill
  // Bit 1 - Dilated Cloud
  // Bit 2 - Cirrus
  // Bit 3 - Cloud
  // Bit 4 - Cloud Shadow
  // Bit 5 - Snow
  // Bit 6 - Clear
  // Bit 7 - Water
  // Bit 8-9 - Cloud Confidence
  // Bit 10-11 - Cloud Shadow Confidence
  // Bit 12-13 - Snow/Ice Confidence
  // Bit 14-15 - Cirrus Confidence
  var qaMask = image.select('QA_PIXEL').bitwiseAnd(parseInt('11111', 2)).eq(0);
  var waterMask = image.select('QA_PIXEL').bitwiseAnd(1 << 7).eq(0);  
  var snowMask = image.select('QA_PIXEL').bitwiseAnd(1 << 5).eq(0);
  var cloudConf = image.select('QA_PIXEL').rightShift(8).bitwiseAnd(3).lt(2);
  var shadowConf = image.select('QA_PIXEL').rightShift(10).bitwiseAnd(3).lt(2);
  var snowConf = image.select('QA_PIXEL').rightShift(12).bitwiseAnd(3).lt(2);
  var cirrusConf = image.select('QA_PIXEL').rightShift(14).bitwiseAnd(3).lt(2);
  var saturationMask = image.select('QA_RADSAT').eq(0);

  // Apply the scaling factors to the appropriate bands.
  var opticalBands = image.select('SR_B.').multiply(0.0000275).add(-0.2);

  // Replace the original bands with the scaled ones and apply the masks.
  return image.addBands(opticalBands, null, true)
      .updateMask(qaMask)
      .updateMask(waterMask)
      .updateMask(snowMask)
      .updateMask(cloudConf)
      .updateMask(shadowConf)
      .updateMask(snowConf)
      .updateMask(cirrusConf)
      .updateMask(saturationMask);
}


//Calculate vegetation Index
function addVegIndex(image){
  var vegIndexBand;
  
  if (vegIndex == "NDVI"){ //NDVI
    
      vegIndexBand = image.normalizedDifference([NIRBand, redBand]).rename(vegIndex);
      
    } else if (vegIndex == "NDMI"){ //NDMI
      
      vegIndexBand =image.normalizedDifference([NIRBand, SWIRBand]).rename(vegIndex);
      
    } else if (vegIndex == "EVI") { //EVI
      vegIndexBand = image.expression(
        '2.5 * ((NIR - Red) / (NIR + 6 * Red - 7.5 * Blue + 1))',
        {
          'NIR': image.select(NIRBand),
          'Red': image.select(redBand),
          'Blue': image.select(blueBand)
        }
      ).rename(vegIndex);
      
    } else {
      
      print("Please check the vegetation index you want to calculate. They should be NDVI, NDMI or EVI");
      
    }
  return image.addBands(vegIndexBand);
}


// =====================================================================
// Main
// =====================================================================

// Import satellite data
//Load AOIs
var aoi = ee.FeatureCollection("projects/uw-gis-project-494803/assets/" + aoiPolygon);

//Load Landsat data clipped by AOIs
print("The dataset is " + dataset)

var imageCollection = ee.ImageCollection(dataset)
    .filterDate(startDate, endDate)
    .filterBounds(aoi)  //  Filter images by the bounds of AOIs
    .filter(ee.Filter.lt('CLOUD_COVER', 80)); 
    
// Check if the size of imageCollection is 0
imageCollection.size().evaluate(function(size){
  if (size > 0) {
    print("The image collection's size is " + size);
    print(imageCollection.aggregate_array('DATE_ACQUIRED'));
    // Cloud masking for each image
    if(dataset == dataL5 || dataset == dataL7) {
      imageCollection = imageCollection.map(maskL457sr);
    } else if (dataset == dataL8) {
      imageCollection = imageCollection.map(maskL8sr);
    }
    
    //Calculate vegetation index for each image
    imageCollection = imageCollection.map(addVegIndex);
    
    //Select vegetation index band from each image and composite
    //And clip results by AOIs
    var composite;
    if (compositeStrategy == "Max") {
      composite = imageCollection.select(vegIndex).max().clip(aoi);
    } else if (compositeStrategy == "Mean") {
      composite = imageCollection.select(vegIndex).mean().clip(aoi);
    } else if (compositeStrategy == "Median") {
      composite = imageCollection.select(vegIndex).median().clip(aoi);
    }

    
    //For NDVI and EVI, negative values are removed
    if (vegIndex == "NDVI" || vegIndex == "EVI") {
      composite = composite.updateMask(composite.gte(0)
       .and(composite.lt(1))
       );
      print("Values outside [0, 1] are removed.")
    }
    
    print(compositeStrategy + " " + vegIndex + ' ' + dateInFileName + ' ' + aoiPolygon.slice(9,14) + " generated.");
    
    //Get the range of composite values
    var stats = composite.reduceRegion({
      reducer: ee.Reducer.minMax(),
      geometry: aoi.geometry(),
      scale: 30,
      maxPixels: 1e9
    });
    print('Min/Max' + vegIndex);
    print(stats);
    //Get valid pixel count
    var pixelCount = composite.reduceRegion({
      reducer: ee.Reducer.count(),
      geometry: aoi.geometry(),
      scale: 30,
      bestEffort: true
    });
    print("pixelCount", pixelCount);
    
    //Display the results
    // Make a palette: a list of hex strings.
    var visParams = {
      min: vegIndex == "NDMI" ? -1 : 0, 
      max: 1, 
      palette: ['FF6600', 'FF9900', 'FFCC00', 'CCFF00', '99CC00', '669900', '336600']
        // ['FF6600', '336600']
        // ['FFFFFF', 'CE7E45', 'DF923D', 'F1B555', 'FCD163', '99B718',
        //           '74A901', '66A000', '529400', '3E8601', '207401', '056201',
        //           '004C00', '023B01', '012E01', '011D01', '011301']
    }
                   
    Map.centerObject(aoi);
    //Map.addLayer(imageCollection.first());
    Map.addLayer(composite, visParams, compositeStrategy + '_' + vegIndex + '_' + dateInFileName + '_' + aoiPolygon.slice(9,14));
    //Map.addLayer(imageCollection, null, 'All images');
    
    //Export composite result
    var datasetNum = dataset[11] == "5" ? "" : dataset[11]
    Export.image.toDrive({
      image: composite,
      description: compositeStrategy + '_' + vegIndex + '_' + dateInFileName + '_' + aoiPolygon.slice(9,14) + '_Landsat' + datasetNum + '_WGS84',
      scale: 30,
      crs: 'EPSG:4326', //WGS 84
      region: aoi.geometry(),
      maxPixels: 1e9,
      folder: 'GEE_Exports'
    });
    
  } else {
    print("There is no image data in this month.");
  }
}) 




