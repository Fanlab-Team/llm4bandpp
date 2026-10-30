# Fig. 3. The probing envelope of the deployed system

| File | Content |
|---|---|
| `fig_envelope.tex` | TikZ source of the figure (standalone document); all values are typed in it |
| `icons/` | the icons drawn in the figure, from the authors' LLM4Band slides |
| `fig_envelope.pdf` | the figure as it appears in the paper |

Rebuild here with `xelatex fig_envelope.tex` (TeX Live with `fontspec` and TikZ, and the Arial font). The output is
pixel-identical to `fig_envelope.pdf`; `reproduce/verify_level1.py` checks this.

The thresholds and actions are the constants at the top of `scripts/alphartc/deploy/safety_envelope_v6.py` (deployed
version, with the shadow-GCC rules) and `scripts/alphartc/deploy/safety_envelope_v4.py`. See also
[the results index](../../docs/RESULTS_INDEX.md#fig-3-probing-envelope).
