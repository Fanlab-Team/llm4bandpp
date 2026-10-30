# Fig. 2. Overview of LLM4band++

| File | Content |
|---|---|
| `fig_llm_position.tex` | TikZ source of the figure (standalone document) |
| `icons/` | the five icons drawn in the figure (camera, network, traces, nn, loop), from the authors' LLM4Band slides |
| `fig_llm_position.pdf` | the figure as it appears in the paper |

Rebuild here with `xelatex fig_llm_position.tex` (TeX Live with `fontspec` and TikZ, and the Arial font). The output is
pixel-identical to `fig_llm_position.pdf`; `reproduce/verify_level1.py` checks this. See also
[the results index](../../docs/RESULTS_INDEX.md#fig-2-system-overview).
