# Evaluating forest disturbances and responses to management in the Central Appalachians

**Sponsored by:** The Nature Conservancy  
**Note:** This project was a collaborative effort by a 4-person team. The code in this repository represents only my individual contributions.

### Project Overview
This project analyzes how vegetation responds to different climatic conditions (wet vs. dry) during the growing season by comparing vegetation indices (NDVI, NDMI, and EVI).

My specific contribution to this project was analyzing how vegetation responds to prescribed fires in the Central Appalachians. I developed the Python analytical pipeline to compare unburned and burned forest areas categorized by post-fire time intervals under both dry and wet conditions. The vegetation indices were derived from Google Earth Engine (GEE) imagery during the growing seasons of 2002 (dry) and 2003 (wet).

### Repository Structure
*   **`GEE_scripts.js`**: Google Earth Engine script used to generate the base GeoTiff files.
*   **`Python/`**: Folder containing Jupyter Notebooks for geospatial data cleaning, geoprocessing, and visualization. 

### How the Pipeline Works
The workflow follows this order:
*   `01_Preprocessing_GEE_Vegetation_Index.ipynb`: preprocesses Google Earth Engine-derived Landsat vegetation index GeoTIFFs by converting them to raster datasets and applying reprojection, resampling and raster snapping.
*   `02_Preprocessing_Extract_Burned_Unburned_Raster_by_TSF.ipynb`: extracts burned and unburned forest-type and Landsat vegetation-index rasters for 2002 and 2003 based on burn history. The burned areas are classified based on post-fire time intervals, referred to as time since fire (TSF) in the notebooks.
*   `03_Analysis_AOI_North_2002vs2003.ipynb`: compares 2002 dry-year and 2003 wet-year Landsat vegetation responses across cool, intermediate, and hot forest types using NDVI, NDMI, and EVI.
*   `04_Analysis_AOI_North_Burned_Unburned_2002vs2003.ipynb`: compares vegetation responses in burned and unburned areas across different time-since-fire classes and forest types for 2002 (dry) and 2003 (wet) using NDVI, NDMI, and EVI.

### Environment Requirements
*   **ArcGIS Pro** installed on your computer.
*   Python environment with **ArcPy** configured (ArcGIS Pro's default or cloned environment).

### ⚠️ Data Availability
Due to file size limits, the raw GeoTiff images, the ArcGIS Pro project file (`.aprx`), and the Geodatabase (`.gdb`) are **not included** in this GitHub repository. 

