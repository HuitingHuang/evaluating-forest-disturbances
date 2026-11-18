# Evaluating forest disturbances and responses to management in the Central Appalachians

**Sponsored by:** The Nature Conservancy  
**Note:** This project was a collaborative effort by a 4-person team. The code in this repository represents only my individual contributions.

### Project Overview
This project analyzes how vegetation responds to different climatic conditions (wet vs. dry) during the growing season by comparing vegetation indices (NDVI, NDMI, and EVI).

My specific contribution to this project was analyzing how vegetation responds to prescribed fires in the Central Appalachians. I developed the Python analytical pipeline to compare unburned and burned forest areas categorized by post-fire time intervals under both dry and wet conditions. The vegetation indices were derived from Google Earth Engine (GEE) imagery during the growing seasons of 2002 (dry) and 2003 (wet).

The GEE script and Python notebooks in this repository, including data cleaning, geoprocessing, and visualization for the fire analysis, represent my individual work on the project.

### Repository Structure
*   **`GEE_scripts.js`**: Google Earth Engine script used to generate the base GeoTiff files.
*   **`Python/`**: Folder containing Jupyter Notebooks for geospatial data cleaning, geoprocessing, and visualization. Please run them in the following order:
    *   `01_... .ipynb`
    *   `02_... .ipynb` 
    *   `03_... .ipynb`
    *   `04_... .ipynb`

### Environment Requirements
*   **ArcGIS Pro** installed on your computer.
*   Python environment with **ArcPy** configured (ArcGIS Pro's default or cloned environment).

### Note on Data and Paths
Due to file size limits, the raw GeoTiff images, the ArcGIS Pro project file (`.aprx`), and the Geodatabase (`.gdb`) are **not included** in this GitHub repository. 

**How to run the code:**
Before running the notebooks in the `Python/` folder, you must change the absolute file paths in the code to match where you saved your own `.aprx` and` .gdb` files on your local computer. Start with the `01_...` notebook and follow the numbered order.