# Teaching Resource Builder — Web Questionnaire

A web-based questionnaire tool that walks teachers through the process of specifying a teaching resource. The tool's output is a structured prompt you can give to an AI coding agent (like GitHub Copilot) to generate the resource content modules, configuration files, and build the final `.docx` or `.pptx` output.

## 🚀 Quick Start — Hosted Version

Use the live questionnaire to generate your agent prompt:

👉 **[https://webtoolquestionaire-git-main-mni-beeps-projects.vercel.app/](https://webtoolquestionaire-git-main-mni-beeps-projects.vercel.app/)**

Fill in the form, copy the generated prompt at the end, and paste it into your AI agent to build the resource.

## 🖥️ Running Locally

```bash
pnpm install
pnpm dev
```

Then open `http://localhost:3000` in your browser.

## 📦 Building for Production

```bash
pnpm build
pnpm start
```

## 📄 What It Generates

The questionnaire covers:

- **Output format** — DOCX (printable document) or PPTX (slide deck)
- **Resource type** — worksheet, booklet, unit guide, assessment, lab manual, revision guide, E5 lesson, standard lesson, revision deck, etc.
- **Subject, year level, difficulty** — tailored to your classroom
- **Structure** — number of lessons/weeks, sections, cover/contents pages
- **Question types and scaffolding** — multiple choice, short answer, extended response, tables, worked examples
- **Images, diagrams, YouTube videos** — optional media
- **Output preferences** — filename, header, creator name

The final prompt follows the `AGENTS.md` interview format and is ready to paste into an AI coding agent configured with this project's instructions.
