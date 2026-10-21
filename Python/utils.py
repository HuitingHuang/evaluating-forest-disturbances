import arcpy
import numpy as np
import matplotlib.pyplot as plt
from scipy.stats import gaussian_kde

# Zonal statistics by forest type
# Extract raster values by zone
def zonal_stats(in_raster, zone_raster, zone_labels):

    """
    Extract raster values by zone using NumPy array masking.
    
    Parameters
    ----------
    in_raster : str
        Name of the value raster dataset in the workspace.
    zone_raster : str
        Name of the zone raster dataset in the workspace.
    zone_labels : dict
        Dictionary mapping zone values to zone names, e.g. {1: "Cool", 2: "Intermediate", 3: "Hot"}.
   
    Returns
    -------
    data : list of np.ndarray
        List of 1D arrays containing pixel values for each zone.
    labels : list of str
        List of zone names corresponding to each array in data.
    """
    ext = arcpy.Describe(in_raster).extent
    
    in_raster_arr = arcpy.RasterToNumPyArray(in_raster, nodata_to_value=np.nan)
    zone_arr = arcpy.RasterToNumPyArray(
        zone_raster,
        lower_left_corner = arcpy.Point(ext.XMin, ext.YMin),
        ncols             = in_raster_arr.shape[1],
        nrows             = in_raster_arr.shape[0],
        nodata_to_value   = 0
    )

    #print("Input raster's size", in_raster_arr.shape)
    #print("Zone raster's size", zone_arr.shape)
    
    data, labels = [], []
    for zone_id, zone_name in zone_labels.items():
        zone_values = in_raster_arr[zone_arr == zone_id]
        zone_values = zone_values[~np.isnan(zone_values)]
        data.append(zone_values)
        labels.append(zone_name)

    return data, labels

# Create plots
# Box plot
def create_boxplot(data_dry, data_wet, labels, legend_labels, composite_strategy, vegetation_index):
    """
    Parameters
    ----------
    data_dry: e.g. data_2002
    data_wet: e.g. data_2003
    labels: e.g. ["Cool", "Intermediate", "Hot"]
    legend_labels: e.g. ["2002 (Dry)", "2003 (Wet)"]
    composite_strategy: e.g. Max
    vegetation_index: e.g.NDVI
    """
    
    fig, ax = plt.subplots(figsize=(10, 5))
    bp1 = ax.boxplot(data_dry, positions=[1, 4, 7], widths=0.4, patch_artist=True,
                    medianprops=dict(color="red", linewidth=2),
                    showfliers=False,
                    flierprops=dict(marker="o", markersize=3, alpha=0.3, markeredgecolor="orange")
                   )
    bp2 = ax.boxplot(data_wet, positions=[2, 5, 8], widths=0.4, patch_artist=True,
                    medianprops=dict(color="red", linewidth=2),
                    showfliers=False,
                    flierprops=dict(marker="o", markersize=3, alpha=0.3, markeredgecolor="blue")
                   )
    
    for patch in bp1["boxes"]:
        patch.set_facecolor("orange")
        patch.set_alpha(0.7)
    for patch in bp2["boxes"]:
        patch.set_facecolor("blue")
        patch.set_alpha(0.7)
    
    ax.set_xticks([1.5, 4.5, 7.5])
    ax.set_xticklabels(labels)
    ax.legend([bp1["boxes"][0], bp2["boxes"][0]], legend_labels, loc="upper left", bbox_to_anchor=(1, 1)) #loc="lower right"
    ax.set_title(f"{composite_strategy} {vegetation_index} Composite by Forest Type (Growing Season Jun–Aug)")
    ax.set_ylabel(f"{vegetation_index}")
    #ax.axhline(0, color="gray", linestyle="--", linewidth=0.8)
    ax.grid(axis="y", linestyle="--", alpha=0.4)
    
    fig.tight_layout(rect=[0, 0, 0.8, 1])

    return fig, ax

# Gaussian Kernel Density Estimation
def create_gaussian_kde(data_dry, data_wet, labels, legend_labels, composite_strategy, vegetation_index):
    """
    Parameters
    ----------
    data_dry: e.g. data_2002
    data_wet: e.g. data_2003
    labels: e.g. ["Cool", "Intermediate", "Hot"]
    legend_labels: e.g. ["2002 (Dry)", "2003 (Wet)"]
    composite_strategy: e.g. Max
    vegetation_index: e.g.NDVI
    """
    fig, axes = plt.subplots(1, 3, figsize=(15, 5), sharey=True)
    for i, (ax, label) in enumerate(zip(axes, labels)):
        for data, year, color in [(data_dry[i], legend_labels[0], "orange"), 
                                    (data_wet[i], legend_labels[1], "blue")
                                 ]:
            kde = gaussian_kde(data)
            x   = np.linspace(data.min(), data.max(), 100)
            ax.plot(x, kde(x), label=year, color=color)
            ax.fill_between(x, kde(x), alpha=0.2, color=color)
        
        ax.set_title(label)
        ax.set_xlabel(f"{vegetation_index}")
        ax.set_ylabel("Density")
        ax.legend()
        
    fig.suptitle(f"{composite_strategy} {vegetation_index} Composite Distribution by Forest Type (Growing Season Jun–Aug)")
    fig.tight_layout()

    return fig, axes

# Histogram
def create_histogram(data_dry, data_wet, labels, legend_labels, composite_strategy, vegetation_index):
    """
    Parameters
    ----------
    data_dry: e.g. data_2002
    data_wet: e.g. data_2003
    labels: e.g. ["Cool", "Intermediate", "Hot"]
    legend_labels: e.g. ["2002 (Dry)", "2003 (Wet)"]
    composite_strategy: e.g. Max
    vegetation_index: e.g. NDVI
    """
    fig, axes = plt.subplots(1, 3, figsize=(15, 5), sharey=True)
    for i, (ax, label) in enumerate(zip(axes, labels)):
        for data, year, color in [(data_dry[i], legend_labels[0], "orange"),
                                  (data_wet[i], legend_labels[1], "blue")]:
            ax.hist(data, bins=30, alpha=0.5, density=True, color=color, label=year)

        ax.set_title(label)
        ax.set_xlabel(f"{vegetation_index}")
        ax.set_ylabel("Density")
        ax.legend()

    fig.suptitle(f"{composite_strategy} {vegetation_index} Composite Distribution by Forest Type (Growing Season Jun–Aug)")
    fig.tight_layout()
    return fig, axes

# Bar chart
def create_bar_chart(data_dry, data_wet, labels, legend_labels, composite_strategy, vegetation_index):
    """
    Parameters
    ----------
    data_dry: e.g. data_2002
    data_wet: e.g. data_2003
    labels: e.g. ["Cool", "Intermediate", "Hot"]
    legend_labels: e.g. ["2002 (Dry)", "2003 (Wet)"]
    composite_strategy: e.g. Max
    vegetation_index: e.g. NDVI
    """
    means_dry = [np.mean(d) for d in data_dry]
    means_wet = [np.mean(d) for d in data_wet]
    
    x = np.arange(len(labels))
    width = 0.2
    
    fig, ax = plt.subplots(figsize=(8, 3))
    bars_dry = ax.bar(x - width/2, means_dry, width, label=legend_labels[0],   color="orange", alpha=0.7)
    bars_wet = ax.bar(x + width/2, means_wet, width, label=legend_labels[1],   color="blue",   alpha=0.7)
    
    ax.set_xticks(x)
    ax.set_xticklabels(labels)
    ax.set_title(f"Mean value of {vegetation_index} Composite ({composite_strategy}) by Forest Type (Growing Season Jun–Aug)")
    ax.set_ylabel(f"{vegetation_index}")
    ax.legend(loc="upper left", bbox_to_anchor=(1, 1))
    ax.grid(axis="y", linestyle="--", alpha=0.4)
    ax.bar_label(bars_dry, fmt="%.3f")
    ax.bar_label(bars_wet, fmt="%.3f")
    
    fig.tight_layout()
    return fig, ax