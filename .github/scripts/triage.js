// Rule-based issue triage for the LLM4band++ package. No model and no secret: it reads the issue form, labels the issue,
// and keeps one comment up to date with the checks that fit the reported problem. Run by .github/workflows/issue-triage.yml.
const MARK = "<!-- llm4bandpp-triage -->";
const REPO = "https://github.com/Fanlab-Team/llm4bandpp/blob/main";
const LABELS = {
  reproduction: { color: "1E6E71", description: "A result or command of the package does not come out as in the paper" },
  "needs-info": { color: "D4C5F9", description: "Please complete the fields named in the triage comment" },
};

// Value of one issue-form field ("### Label" followed by its text); "" when empty.
function field(body, name) {
  const re = new RegExp("^###\\s+" + name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\s*$([\\s\\S]*?)(?=^###\\s|(?![\\s\\S]))", "m");
  const m = body.match(re);
  if (!m) return "";
  const v = m[1].replace(/^```[a-z]*\s*$/gim, "").trim();
  return v === "_No response_" ? "" : v;
}

function kindOf(issue) {
  const names = (issue.labels || []).map((l) => (typeof l === "string" ? l : l.name));
  for (const k of ["reproduction", "question", "bug"]) if (names.includes(k)) return k;
  const t = (issue.title || "").toLowerCase();
  if (t.startsWith("[reproduction]")) return "reproduction";
  if (t.startsWith("[question]")) return "question";
  if (t.startsWith("[bug]")) return "bug";
  return "other";
}

// What is missing, and which checks fit, for an issue of the given kind.
function review(kind, body) {
  const missing = [], tips = [];
  const need = (name, min = 1) => { if (field(body, name).length < min) missing.push(name); };
  if (kind === "reproduction") {
    need("Command"); need("Output", 20); need("Environment");
    const level = field(body, "Level"), out = field(body, "Output"), env = field(body, "Environment");
    if (level.startsWith("Level 1")) {
      tips.push("Run `python3 reproduce/verify_level1.py --keep` and attach the `.diff` files or renders it names; tables must be byte-identical with any library version.");
      tips.push(`Figures are pixel-identical only with the versions of [\`requirements-level1.txt\`](${REPO}/requirements-level1.txt) (Python 3.13, matplotlib 3.11.2); with others they can differ in a few pixels while every number stays the same.`);
    } else if (level.startsWith("Level 2")) {
      tips.push("Rerun the failing check alone with `bash reproduce/run_level2.sh --only <check>` and include its line of the match table.");
      tips.push(`Some checks need torch or onnxruntime, as noted in [\`requirements-level1.txt\`](${REPO}/requirements-level1.txt); a check skipped for a missing library is not a failure.`);
    } else if (level.startsWith("Level 3")) {
      tips.push(`Level 3 needs data, hardware or services from outside the package; [\`docs/PACKAGE.md\`](${REPO}/docs/PACKAGE.md) lists what is not included, and [\`docs/RESULTS_INDEX.md\`](${REPO}/docs/RESULTS_INDEX.md) gives the inputs of each experiment.`);
    } else {
      tips.push(`See "Getting started" in [\`README.md\`](${REPO}/README.md): Linux x86-64, Python 3.13, and TeX Live with pdflatex and xelatex.`);
    }
    if (/xelatex|fontspec|Arial|Times New Roman/i.test(out))
      tips.push("Figs. 2, 3 and S1 need `xelatex` and the Arial and Times New Roman fonts (for example `ttf-mscorefonts-installer` on Ubuntu); without them `verify_level1.py` skips those figures.");
    if (env && !/3\.13/.test(env)) tips.push("The package was tested with Python 3.13; please say whether the problem remains with it.");
    const mpl = env.match(/matplotlib[=\s]+([0-9.]+)/i);
    if (mpl && mpl[1] !== "3.11.2") tips.push(`matplotlib ${mpl[1]} is installed; the figures were made with 3.11.2, so pixel differences in figures are expected.`);
  } else if (kind === "question") {
    need("Question");
    tips.push(`[\`docs/RESULTS_INDEX.md\`](${REPO}/docs/RESULTS_INDEX.md) traces every number of the paper to its experiment and command, and [\`docs/GLOSSARY.md\`](${REPO}/docs/GLOSSARY.md) maps file names and labels to the paper's terms.`);
  } else if (kind === "bug") {
    need("File"); need("What happens, and what you expected"); need("How to trigger it");
    tips.push("A minimal command with its full output helps us most.");
  } else {
    missing.push("an issue form (please open a new issue and choose one of the forms)");
  }
  return { missing, tips };
}

function render(kind, r) {
  const what = { reproduction: "reproduction problem", question: "question", bug: "bug report", other: "issue" }[kind];
  const lines = [MARK, `Thank you for the ${what}. A maintainer will reply; meanwhile, this automated check lists what helps us answer.`];
  if (r.missing.length) lines.push("", "**Please add:** " + r.missing.join(", ") + ". You can edit the issue; this comment updates itself.");
  else lines.push("", "All required fields are filled in.");
  if (r.tips.length) lines.push("", "**Worth checking:**", ...r.tips.map((t) => "- " + t));
  return lines.join("\n");
}

module.exports = async ({ github, context }) => {
  const issue = context.payload.issue;
  if (!issue || issue.pull_request) return;
  const { owner, repo } = context.repo, issue_number = issue.number;
  const kind = kindOf(issue), r = review(kind, issue.body || ""), text = render(kind, r);
  for (const [name, spec] of Object.entries(LABELS)) {
    try { await github.rest.issues.createLabel({ owner, repo, name, ...spec }); } catch (e) { if (e.status !== 422) throw e; }
  }
  const comments = await github.paginate(github.rest.issues.listComments, { owner, repo, issue_number, per_page: 100 });
  const mine = comments.find((c) => c.user && c.user.type === "Bot" && (c.body || "").startsWith(MARK));
  if (mine) { if (mine.body !== text) await github.rest.issues.updateComment({ owner, repo, comment_id: mine.id, body: text }); }
  else await github.rest.issues.createComment({ owner, repo, issue_number, body: text });
  const names = (issue.labels || []).map((l) => (typeof l === "string" ? l : l.name));
  if (kind !== "other" && !names.includes(kind)) await github.rest.issues.addLabels({ owner, repo, issue_number, labels: [kind] });
  const has = names.includes("needs-info");
  if (r.missing.length && !has) await github.rest.issues.addLabels({ owner, repo, issue_number, labels: ["needs-info"] });
  if (!r.missing.length && has) await github.rest.issues.removeLabel({ owner, repo, issue_number, name: "needs-info" });
};
module.exports.review = review; module.exports.field = field; module.exports.kindOf = kindOf; module.exports.render = render;
