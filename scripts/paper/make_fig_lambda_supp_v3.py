#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Fig. S1 of the supplement, v3: the HCQ weight sweep of the deployed recipe, mean over three seeds with the minimum-to-maximum
range; (a) MSE divided by the mean at lambda = 0.4, (b) the overestimation rate e+. Data and computation are those of v2
(experiments/results/ch_lambda_sweep_v1/summary.json); only the style changed, to match Figs. 4 and 5 of the paper: Arial
text, Times sub-captions under each panel, a teal and grey palette, left and bottom axes, a light horizontal grid, the
legend above without a frame, the deployed lambda = 0.4 marked by a light band, and capped error bars. The three lines
differ in colour, line style and marker, so the figure reads in greyscale.
Needs matplotlib 3.11.2 and the Arial and Times New Roman fonts for a pixel-identical output.
Usage: make_fig_lambda_supp_v3.py [OUT_DIR]   (default papers/revision-v2/supplement)"""
import json, sys
from pathlib import Path
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.lines import Line2D
from matplotlib.ticker import FixedLocator
ROOT = Path(__file__).resolve().parents[2]
OUT = Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT / "papers/revision-v2/supplement"
OUT.mkdir(parents=True, exist_ok=True)
T = json.loads((ROOT / "experiments/results/ch_lambda_sweep_v1/summary.json").read_text())
LAMS = ["0.0", "0.2", "0.4", "0.6", "0.8", "1.0"]
INK, GRID, BAND = "#262626", "#E6E6E6", "#EEF1F3"
SER = [("Low BW", "Low BW", dict(color="#1E6E71", ls="-", marker="o", ms=4.0)),
       ("High BW", "High BW", dict(color="#4FB3B6", ls="--", marker="s", ms=3.6)),
       ("Fluctuating", "Fluctuating", dict(color="#8C8C8C", ls=":", marker="^", ms=4.2))]
plt.rcParams.update({"pdf.fonttype": 42, "ps.fonttype": 42, "font.family": "Arial", "font.size": 7, "axes.labelsize": 7,
                     "xtick.labelsize": 7, "ytick.labelsize": 7, "legend.fontsize": 7, "axes.linewidth": 0.6,
                     "xtick.major.width": 0.6, "ytick.major.width": 0.6, "xtick.major.size": 2.5, "ytick.major.size": 2.5,
                     "axes.edgecolor": INK, "xtick.color": INK, "ytick.color": INK, "axes.labelcolor": INK, "savefig.bbox": None,
                     "mathtext.fontset": "custom", "mathtext.rm": "Arial", "mathtext.it": "Arial:italic", "mathtext.bf": "Arial:bold"})
W, H = 3.5, 1.70                                   # one column wide
SUBCAP = {"family": "Times New Roman", "size": 8}


def main():
    x = [float(l) for l in LAMS]
    fig = plt.figure(figsize=(W, H))
    axes = [fig.add_axes((0.47 / W, 0.50 / H, 1.20 / W, 0.95 / H)), fig.add_axes((2.20 / W, 0.50 / H, 1.20 / W, 0.95 / H))]
    out = {}
    for k, lab, st in SER:
        ref = T["0.4"][f"{k}|mse"]["mean"]
        for ax, key, sc in ((axes[0], f"{k}|mse", ref), (axes[1], f"{k}|over", 1.0)):
            m = [T[l][key]["mean"] / sc for l in LAMS]
            lo = [m[i] - T[l][key]["min"] / sc for i, l in enumerate(LAMS)]; hi = [T[l][key]["max"] / sc - m[i] for i, l in enumerate(LAMS)]
            ax.errorbar(x, m, yerr=[lo, hi], color=st["color"], ls=st["ls"], lw=1.1, marker=st["marker"], ms=st["ms"],
                        mfc=st["color"], mec="white", mew=0.5, elinewidth=0.6, capsize=1.6, capthick=0.6, zorder=3,
                        label=lab if ax is axes[0] else None)
        out[k] = {"mse_mean": [T[l][f"{k}|mse"]["mean"] for l in LAMS], "over_mean": [T[l][f"{k}|over"]["mean"] for l in LAMS]}
    for ax in axes:
        for sp in ("top", "right"): ax.spines[sp].set_visible(False)
        ax.axvspan(0.33, 0.47, color=BAND, zorder=0, lw=0)
        ax.grid(True, axis="y", color=GRID, lw=0.5); ax.set_axisbelow(True)
        ax.set_xlim(-0.06, 1.06); ax.xaxis.set_major_locator(FixedLocator([0, 0.2, 0.4, 0.6, 0.8, 1.0]))
        ax.set_xticklabels(["0", "0.2", "0.4", "0.6", "0.8", "1"])
        ax.set_xlabel(r"HCQ weight $\lambda$", labelpad=1.5)
        ax.text(0.4, 1.0, "deployed", transform=ax.get_xaxis_transform(), ha="center", va="bottom", fontsize=6.5, color="#5A5A5A")
    axes[0].set_ylabel(r"MSE / MSE at $\lambda = 0.4$", labelpad=2)
    axes[0].yaxis.set_major_locator(FixedLocator([0.95, 1.0, 1.05, 1.1]))
    axes[1].set_ylabel(r"Overestimation $e^{+}$", labelpad=2)
    axes[1].yaxis.set_major_locator(FixedLocator([0, 0.5, 1.0]))
    h = [Line2D([], [], color=st["color"], ls=st["ls"], lw=1.1, marker=st["marker"], ms=st["ms"], mfc=st["color"], mec="white", mew=0.5) for _, _, st in SER]
    l = [lab for _, lab, _ in SER]
    fig.legend(h, l, loc="upper center", bbox_to_anchor=(0.5, 1.0), ncol=3, frameon=False, handlelength=2.2, columnspacing=1.6,
               handletextpad=0.5, borderaxespad=0.1)
    for ax, s in ((axes[0], "(a) MSE relative to $\\lambda = 0.4$"), (axes[1], "(b) Overestimation rate $e^{+}$")):
        p = ax.get_position(); fig.text((p.x0 + p.x1) / 2, 0.012, s, ha="center", va="bottom", fontdict=SUBCAP, math_fontfamily="stix")   # sub-captions in Times, as in the paper's figures
    fig.savefig(OUT / "figS_lambda.pdf")
    (OUT / "figS_lambda.json").write_text(json.dumps({"lambda": x, "per_scenario": out, "source": "experiments/results/ch_lambda_sweep_v1/summary.json"}, indent=1))
    print("saved", OUT / "figS_lambda.pdf")


if __name__ == "__main__":
    main()
