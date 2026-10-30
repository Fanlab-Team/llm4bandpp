# Fig. 4. The designer and the schema matchers, by method

The plotted values are in `data/`. The figure in the paper, `fig_designer_three_paper.pdf`, was restyled by a co-author
from these values (Arial and Times, as in the other figures); `plot_fig4.py` draws the same values in the package's
earlier style, and `reproduce/verify_level1.py` checks that rendering against `expected/`.

| File | Content |
|---|---|
| `plot_fig4.py` | plotting script; reads only `data/` and `ieee_style.py` |
| `ieee_style.py` | shared figure style and checks (copy of `scripts/paper/ieee_style.py`) |
| `data/panel_ab_bars.csv` | panels (a) and (b): one row per method, top to bottom as plotted |
| `data/panel_c_cells.csv` | panel (c): one row per schema and window cell |
| `data/constants.json` | the 10-point loss line of panel (c) |
| `fig_designer_three_paper.pdf` | the figure as it appears in the paper (restyled by a co-author from `data/`) |

```bash
pip install numpy==2.5.3 matplotlib==3.11.2      # versions used for the paper
python3 plot_fig4.py                             # writes fig_designer_three.pdf here
```

Text is typeset by `pdflatex` through matplotlib's PGF backend with `helvet` and `sansmath`, so TeX Live is needed.
Before writing, the script checks that no text overlaps lines or other text, that no font is below 7 pt and that the
width fits two columns (516 pt). `FIG3_H` sets the height in inches (default 2.00); `FIG3_HATCH` (`h1`, `h2`, `h3`) and
`FIG3_BASE` change the style of the non-LLM matchers.

**Columns.**
`data/panel_ab_bars.csv`: `method`; `kind` (`ours`: the designer; `same_llm`: the same hosted LLM used in two steps or as a
generic matcher; `open`: open R1 distillations, mean of three samples with `*_min` and `*_max` over the samples;
`base`: non-LLM matchers); `balanced_accuracy` on the 12 held-out client stacks; `share_cells_correct` of the 42
feature-run cells checked against packet captures of four real programs.
`data/panel_c_cells.csv`: `mapping` (Designer, Name, Distribution, Unadapted); `cell` index; `utility_vs_true_mapping`, the
closed-loop utility of the mapping minus that of the true mapping (32, 32, 32 and 24 cells).

**Where the values come from.** `python3 scripts/paper/export_figure_data_v1.py` (package root, paths set as in
`docs/PACKAGE.md`) writes `data/` from `bar_rows` and `cl_cells` of `scripts/paper/make_fig_designer_v4.py`, the functions
the paper's generator `scripts/paper/make_fig_designer_v6.py` uses, including their checks against the registry. The
inputs and the commands that recompute each number are in [the results index](../../docs/RESULTS_INDEX.md#fig-4-designer-by-method).
