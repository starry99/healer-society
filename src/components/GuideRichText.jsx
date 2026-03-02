import { Fragment, useEffect } from "react";

function renderInlineSkills(line, keyPrefix) {
  const skillPattern = /\[\[([^[\]]+)\]\]/g;
  const chunks = [];
  let lastIndex = 0;

  for (const match of line.matchAll(skillPattern)) {
    const [raw, rawToken] = match;
    const index = match.index ?? 0;
    const token = rawToken.trim();
    const idMatched = token.match(/^(.*)#(\d+)$/);
    const skillName = (idMatched ? idMatched[1] : token).trim();
    const spellId = idMatched?.[2] || "";

    if (index > lastIndex) {
      chunks.push(line.slice(lastIndex, index));
    }

    if (spellId) {
      chunks.push(
        <a
          className="wowhead-skill rounded px-0.5 text-sky-300 underline decoration-sky-500/60 underline-offset-4 transition hover:text-sky-200"
          data-wh-icon-size="small"
          data-wh-rename-link="false"
          href={`https://www.wowhead.com/ko/spell=${spellId}`}
          key={`${keyPrefix}-${spellId}-${index}`}
          rel="noreferrer"
          target="_blank"
        >
          {skillName}
        </a>
      );
    } else {
      chunks.push(
        <span className="rounded px-0.5 text-sky-200" key={`${keyPrefix}-skill-${index}`}>
          {skillName}
        </span>
      );
    }

    lastIndex = index + raw.length;
  }

  if (lastIndex < line.length) {
    chunks.push(line.slice(lastIndex));
  }

  return chunks.length > 0 ? chunks : line;
}

function renderInlineSkillsWithBreaks(text, keyPrefix) {
  const value = typeof text === "string" ? text : String(text ?? "");
  const lines = value.split(/<br\s*\/?>|\\n/gi);

  return lines.map((line, lineIndex) => (
    <Fragment key={`${keyPrefix}-line-${lineIndex}`}>
      {lineIndex > 0 ? <br /> : null}
      {renderInlineSkills(line, `${keyPrefix}-${lineIndex}`)}
    </Fragment>
  ));
}

function parseTableRow(line) {
  if (typeof line !== "string" || !line.includes("|")) {
    return [];
  }

  const trimmed = line.trim();
  const withoutEdges = trimmed.replace(/^\|/, "").replace(/\|$/, "");
  return withoutEdges.split("|").map((cell) => cell.trim());
}

function isSeparatorCell(cell) {
  return /^:?-{3,}:?$/.test(cell.trim());
}

function parseMarkdownTable(block) {
  const lines = block
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length < 2) {
    return null;
  }

  const headers = parseTableRow(lines[0]);
  const separator = parseTableRow(lines[1]);

  if (headers.length < 2 || separator.length !== headers.length) {
    return null;
  }
  if (!separator.every(isSeparatorCell)) {
    return null;
  }

  const rows = lines
    .slice(2)
    .map(parseTableRow)
    .filter((cells) => cells.length === headers.length);

  return {
    headers,
    rows
  };
}

function findEmbeddedMarkdownTable(rawLines = []) {
  const lines = rawLines.map((line) => line.trim());

  for (let start = 0; start < lines.length - 1; start += 1) {
    const headers = parseTableRow(lines[start]);
    const separator = parseTableRow(lines[start + 1]);

    if (headers.length < 2 || separator.length !== headers.length || !separator.every(isSeparatorCell)) {
      continue;
    }

    const rows = [];
    let end = start + 2;
    while (end < lines.length) {
      const cells = parseTableRow(lines[end]);
      if (cells.length !== headers.length) {
        break;
      }
      rows.push(cells);
      end += 1;
    }

    return {
      start,
      end,
      headers,
      rows
    };
  }

  return null;
}

function renderTable(table, keyPrefix) {
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-700/80 bg-gray-950/55 p-2" key={`${keyPrefix}-table`}>
      <table className="min-w-full text-left text-[11px] md:text-xs">
        <thead className="bg-slate-900/80 text-slate-200">
          <tr>
            {table.headers.map((header, cellIndex) => (
              <th className="whitespace-nowrap border border-slate-700/80 px-2 py-1.5 font-semibold" key={`${keyPrefix}-head-${cellIndex}`}>
                {renderInlineSkillsWithBreaks(header, `${keyPrefix}-head-${cellIndex}`)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="text-slate-100">
          {table.rows.map((row, rowIndex) => (
            <tr className="odd:bg-slate-900/25" key={`${keyPrefix}-row-${rowIndex}`}>
              {row.map((cell, cellIndex) => (
                <td
                  className={`border border-slate-700/70 px-2 py-1.5 ${cellIndex === 0 ? "whitespace-nowrap font-semibold" : "font-mono"}`}
                  key={`${keyPrefix}-cell-${rowIndex}-${cellIndex}`}
                >
                  {renderInlineSkillsWithBreaks(cell, `${keyPrefix}-cell-${rowIndex}-${cellIndex}`)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function splitContentBlocks(content = "") {
  const lines = String(content ?? "").split("\n");
  const blocks = [];
  let current = [];
  let inCodeFence = false;

  lines.forEach((line) => {
    const trimmed = line.trim();
    const isFence = trimmed.startsWith("```");

    if (isFence) {
      current.push(line);
      inCodeFence = !inCodeFence;
      return;
    }

    if (!inCodeFence && trimmed === "") {
      if (current.length) {
        blocks.push(current.join("\n"));
        current = [];
      }
      return;
    }

    current.push(line);
  });

  if (current.length) {
    blocks.push(current.join("\n"));
  }

  return blocks;
}

function parseFencedCodeBlock(block) {
  const lines = block.split("\n");
  if (lines.length < 2) {
    return null;
  }

  const first = lines[0].trim();
  const last = lines[lines.length - 1].trim();
  if (!first.startsWith("```") || last !== "```") {
    return null;
  }

  return {
    language: first.slice(3).trim(),
    code: lines.slice(1, -1).join("\n")
  };
}

function findEmbeddedFencedCodeBlock(lines = []) {
  for (let start = 0; start < lines.length - 1; start += 1) {
    const startLine = lines[start]?.trim() || "";
    if (!startLine.startsWith("```")) {
      continue;
    }

    const language = startLine.slice(3).trim();
    for (let end = start + 1; end < lines.length; end += 1) {
      const endLine = lines[end]?.trim() || "";
      if (endLine !== "```") {
        continue;
      }

      return {
        start,
        end: end + 1,
        language,
        code: lines.slice(start + 1, end).join("\n")
      };
    }
  }

  return null;
}

function renderCodeBlock({ language = "", code = "" }, keyPrefix) {
  return (
    <div className="space-y-1.5" key={`${keyPrefix}-code`}>
      {language ? <p className="text-[11px] uppercase tracking-[0.08em] text-slate-400">{language}</p> : null}
      <pre className="overflow-x-auto rounded-lg border border-slate-700/80 bg-gray-950/75 p-3">
        <code className="block whitespace-pre font-mono text-[12px] leading-6 text-slate-100">{code}</code>
      </pre>
    </div>
  );
}

export function GuideRichText({ content, compact = false }) {
  useEffect(() => {
    if (window?.WH?.Tooltips?.refreshLinks) {
      window.WH.Tooltips.refreshLinks();
      return;
    }

    if (window?.$WowheadPower?.refreshLinks) {
      window.$WowheadPower.refreshLinks();
    }
  }, [content]);

  const blocks = splitContentBlocks(content);

  return (
    <div className={`space-y-4 text-slate-200 ${compact ? "text-xs leading-6 md:text-sm" : "text-sm leading-7 md:text-[15px]"}`}>
      {blocks.map((block, index) => {
        const lines = block.split("\n");
        const codeBlock = parseFencedCodeBlock(block);
        const embeddedCodeBlock = codeBlock ? null : findEmbeddedFencedCodeBlock(lines);
        const table = parseMarkdownTable(block);
        const embeddedTable = table ? null : findEmbeddedMarkdownTable(lines);
        const isList = lines.every((line) => line.trim().startsWith("- "));
        const isOrderedList = lines.every((line) => /^\s*\d+\.\s+/.test(line));

        if (codeBlock) {
          return renderCodeBlock(codeBlock, `block-${index}`);
        }

        if (embeddedCodeBlock) {
          const beforeLines = lines.slice(0, embeddedCodeBlock.start).filter((line) => line.trim());
          const afterLines = lines.slice(embeddedCodeBlock.end).filter((line) => line.trim());

          return (
            <div className="space-y-3" key={`block-embedded-code-${index}`}>
              {beforeLines.length ? (
                <p>
                  {beforeLines.map((line, lineIndex) => (
                    <Fragment key={`embedded-code-before-${index}-${lineIndex}`}>
                      {lineIndex > 0 ? <br /> : null}
                      {renderInlineSkills(line, `${index}-embedded-code-before-${lineIndex}`)}
                    </Fragment>
                  ))}
                </p>
              ) : null}
              {renderCodeBlock({ language: embeddedCodeBlock.language, code: embeddedCodeBlock.code }, `embedded-${index}`)}
              {afterLines.length ? (
                <p>
                  {afterLines.map((line, lineIndex) => (
                    <Fragment key={`embedded-code-after-${index}-${lineIndex}`}>
                      {lineIndex > 0 ? <br /> : null}
                      {renderInlineSkills(line, `${index}-embedded-code-after-${lineIndex}`)}
                    </Fragment>
                  ))}
                </p>
              ) : null}
            </div>
          );
        }

        if (table) {
          return renderTable(table, `block-${index}`);
        }

        if (embeddedTable) {
          const beforeLines = lines.slice(0, embeddedTable.start).filter((line) => line.trim());
          const afterLines = lines.slice(embeddedTable.end).filter((line) => line.trim());

          return (
            <div className="space-y-3" key={`block-embedded-table-${index}`}>
              {beforeLines.length ? (
                <p>
                  {beforeLines.map((line, lineIndex) => (
                    <Fragment key={`embedded-before-${index}-${lineIndex}`}>
                      {lineIndex > 0 ? <br /> : null}
                      {renderInlineSkills(line, `${index}-embedded-before-${lineIndex}`)}
                    </Fragment>
                  ))}
                </p>
              ) : null}
              {renderTable({ headers: embeddedTable.headers, rows: embeddedTable.rows }, `embedded-${index}`)}
              {afterLines.length ? (
                <p>
                  {afterLines.map((line, lineIndex) => (
                    <Fragment key={`embedded-after-${index}-${lineIndex}`}>
                      {lineIndex > 0 ? <br /> : null}
                      {renderInlineSkills(line, `${index}-embedded-after-${lineIndex}`)}
                    </Fragment>
                  ))}
                </p>
              ) : null}
            </div>
          );
        }

        if (isList) {
          return (
            <ul className="list-disc space-y-1 pl-6 text-sm" key={`block-list-${index}`}>
              {lines.map((line, lineIndex) => (
                <li key={`line-${index}-${lineIndex}`}>{renderInlineSkills(line.replace(/^\s*-\s*/, ""), `${index}-${lineIndex}`)}</li>
              ))}
            </ul>
          );
        }

        if (isOrderedList) {
          return (
            <ol className="list-decimal space-y-1 pl-6" key={`block-ordered-${index}`}>
              {lines.map((line, lineIndex) => (
                <li key={`line-ordered-${index}-${lineIndex}`}>{renderInlineSkills(line.replace(/^\s*\d+\.\s*/, ""), `${index}-${lineIndex}`)}</li>
              ))}
            </ol>
          );
        }

        return (
          <p key={`block-p-${index}`}>
            {lines.map((line, lineIndex) => (
              <Fragment key={`line-${index}-${lineIndex}`}>
                {lineIndex > 0 ? <br /> : null}
                {renderInlineSkills(line, `${index}-${lineIndex}`)}
              </Fragment>
            ))}
          </p>
        );
      })}
    </div>
  );
}
