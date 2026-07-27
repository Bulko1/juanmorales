const MarkdownParser = (() => {
    const escapeHtml = (text) => {
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    };

    const escapeAttr = (url) => {
        return url.replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    };

    const isSafeUrl = (url) => {
        const trimmed = url.trim().toLowerCase();
        return !/^(javascript|data|vbscript):/.test(trimmed);
    };

    const parseInline = (text) => {
        let result = escapeHtml(text);

        result = result.replace(/`([^`\n]+)`/g, (_, code) => `<code>${code}</code>`);

        result = result.replace(/!\[([^\]]*)\]\(([^)\s]+)(?:\s+&quot;([^&]*)&quot;)?\)/g, (match, alt, url, title) => {
            if (!isSafeUrl(url)) return match;
            const safeAlt = alt.replace(/&quot;/g, '"');
            const titleAttr = title ? ` title="${escapeAttr(title).replace(/&quot;/g, '"')}"` : '';
            return `<img src="${escapeAttr(url)}" alt="${escapeAttr(safeAlt)}"${titleAttr} loading="lazy">`;
        });

        result = result.replace(/\[([^\]]+)\]\(([^)\s]+)(?:\s+&quot;([^&]*)&quot;)?\)/g, (match, text, url, title) => {
            if (!isSafeUrl(url)) return match;
            const titleAttr = title ? ` title="${escapeAttr(title).replace(/&quot;/g, '"')}"` : '';
            return `<a href="${escapeAttr(url)}"${titleAttr} target="_blank" rel="noopener noreferrer">${text}</a>`;
        });

        result = result.replace(/~~([^~\n]+)~~/g, '<del>$1</del>');
        result = result.replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>');
        result = result.replace(/__([^_\n]+)__/g, '<strong>$1</strong>');
        result = result.replace(/(^|[^*])\*([^*\n]+)\*/g, '$1<em>$2</em>');
        result = result.replace(/(^|[^_])_([^_\n]+)_/g, '$1<em>$2</em>');

        return result;
    };

    const parseTableRow = (line) => {
        const cells = line.trim().replace(/^\||\|$/g, '').split('|').map(c => c.trim());
        return '<tr>' + cells.map(c => `<td>${parseInline(c)}</td>`).join('') + '</tr>';
    };

    const parseTableAlign = (line) => {
        const cells = line.trim().replace(/^\||\|$/g, '').split('|').map(c => c.trim());
        return cells.map(c => {
            if (/^:-+:$/.test(c)) return ' style="text-align:center"';
            if (/^:-+$/.test(c)) return ' style="text-align:left"';
            if (/^-+:$/.test(c)) return ' style="text-align:right"';
            return '';
        });
    };

    const isTableSeparator = (line) => {
        return /^\s*\|?[\s:|-]+\|[\s:|-]+\|?\s*$/.test(line) &&
            /[-:]/.test(line) &&
            line.replace(/[|\s:-]/g, '').length === 0;
    };

    const parseTable = (lines, startIndex) => {
        const header = parseTableRow(lines[startIndex]);
        const align = parseTableAlign(lines[startIndex + 1]);
        const headerCells = lines[startIndex].trim().replace(/^\||\|$/g, '').split('|').map(c => c.trim());
        let headerHtml = '<tr>' + headerCells.map((c, i) => {
            const style = align[i] || '';
            return `<th${style}>${parseInline(c)}</th>`;
        }).join('') + '</tr>';

        const bodyRows = [];
        let i = startIndex + 2;
        while (i < lines.length && /^\s*\|.*\|\s*$/.test(lines[i])) {
            const cells = lines[i].trim().replace(/^\||\|$/g, '').split('|').map(c => c.trim());
            const rowHtml = '<tr>' + cells.map((c, idx) => {
                const style = align[idx] || '';
                return `<td${style}>${parseInline(c)}</td>`;
            }).join('') + '</tr>';
            bodyRows.push(rowHtml);
            i++;
        }

        return {
            html: `<table><thead>${headerHtml}</thead><tbody>${bodyRows.join('')}</tbody></table>`,
            consumed: i - startIndex
        };
    };

    const parseList = (lines, startIndex) => {
        const orderedMatch = lines[startIndex].match(/^(\s*)(\d+)\.\s+(.*)$/);
        const isOrdered = !!orderedMatch;
        const tag = isOrdered ? 'ol' : 'ul';
        const items = [];
        let i = startIndex;

        while (i < lines.length) {
            const line = lines[i];
            let match;
            if (isOrdered) {
                match = line.match(/^(\s*)(\d+)\.\s+(.*)$/);
            } else {
                match = line.match(/^(\s*)[-*+]\s+(.*)$/);
            }

            if (!match) break;

            let itemHtml = '';

            if (!isOrdered) {
                const taskMatch = line.match(/^\s*[-*+]\s+\[([ xX])\]\s+(.*)$/);
                if (taskMatch) {
                    const checked = taskMatch[1].toLowerCase() === 'x' ? 'checked' : '';
                    itemHtml = `<li class="task-item"><input type="checkbox" disabled ${checked}> ${parseInline(taskMatch[2])}</li>`;
                    items.push(itemHtml);
                    i++;
                    continue;
                }
            }

            const content = match[match.length - 1];
            itemHtml = `<li>${parseInline(content)}</li>`;
            items.push(itemHtml);
            i++;
        }

        return {
            html: `<${tag}>${items.join('')}</${tag}>`,
            consumed: i - startIndex
        };
    };

    const parseBlockquote = (lines, startIndex) => {
        const content = [];
        let i = startIndex;
        while (i < lines.length && /^\s*>/.test(lines[i])) {
            content.push(lines[i].replace(/^\s*>\s?/, ''));
            i++;
        }
        const inner = parseBlocks(content.join('\n'));
        return {
            html: `<blockquote>${inner}</blockquote>`,
            consumed: i - startIndex
        };
    };

    const parseFencedCode = (lines, startIndex) => {
        const firstLine = lines[startIndex];
        const fenceMatch = firstLine.match(/^(\s*)(```|~~~)(.*)$/);
        if (!fenceMatch) return null;

        const fence = fenceMatch[2];
        const lang = fenceMatch[3].trim();
        const codeLines = [];
        let i = startIndex + 1;
        while (i < lines.length && !new RegExp(`^\\s*${fence}\\s*$`).test(lines[i])) {
            codeLines.push(lines[i]);
            i++;
        }
        const langClass = lang ? ` class="language-${escapeAttr(lang)}"` : '';
        return {
            html: `<pre><code${langClass}>${escapeHtml(codeLines.join('\n'))}</code></pre>`,
            consumed: i - startIndex + 1
        };
    };

    const isHorizontalRule = (line) => {
        return /^\s*([-*_])\s*\1\s*\1[\s\1]*$/.test(line) ||
            /^\s*---+\s*$/.test(line) ||
            /^\s*\*\*\*+\s*$/.test(line) ||
            /^\s*___+\s*$/.test(line);
    };

    const parseHeading = (line) => {
        const match = line.match(/^(#{1,6})\s+(.+?)\s*#*\s*$/);
        if (!match) return null;
        const level = match[1].length;
        return `<h${level}>${parseInline(match[2])}</h${level}>`;
    };

    const parseParagraphs = (lines) => {
        return lines
            .filter(l => l.trim().length > 0)
            .map(l => `<p>${parseInline(l)}</p>`)
            .join('');
    };

    const parseBlocks = (input) => {
        const lines = input.split('\n');
        const output = [];
        let i = 0;

        while (i < lines.length) {
            const line = lines[i];

            if (line.trim() === '') {
                i++;
                continue;
            }

            if (isHorizontalRule(line)) {
                output.push('<hr>');
                i++;
                continue;
            }

            const heading = parseHeading(line);
            if (heading) {
                output.push(heading);
                i++;
                continue;
            }

            const fenced = parseFencedCode(lines, i);
            if (fenced) {
                output.push(fenced.html);
                i += fenced.consumed;
                continue;
            }

            if (/^\s*>/.test(line)) {
                const bq = parseBlockquote(lines, i);
                output.push(bq.html);
                i += bq.consumed;
                continue;
            }

            if (i + 1 < lines.length && /^\s*\|.*\|\s*$/.test(line) && isTableSeparator(lines[i + 1])) {
                const table = parseTable(lines, i);
                output.push(table.html);
                i += table.consumed;
                continue;
            }

            if (/^\s*[-*+]\s+/.test(line) || /^\s*\d+\.\s+/.test(line)) {
                const list = parseList(lines, i);
                output.push(list.html);
                i += list.consumed;
                continue;
            }

            const paragraphLines = [];
            while (i < lines.length && lines[i].trim() !== '' &&
                !parseHeading(lines[i]) &&
                !isHorizontalRule(lines[i]) &&
                !/^\s*>/.test(lines[i]) &&
                !/^\s*[-*+]\s+/.test(lines[i]) &&
                !/^\s*\d+\.\s+/.test(lines[i]) &&
                !/^\s*(```|~~~)/.test(lines[i]) &&
                !(i + 1 < lines.length && /^\s*\|.*\|\s*$/.test(lines[i]) && isTableSeparator(lines[i + 1]))) {
                paragraphLines.push(lines[i]);
                i++;
            }
            if (paragraphLines.length > 0) {
                output.push(parseParagraphs(paragraphLines));
            }
        }

        return output.join('\n');
    };

    return {
        render(input) {
            if (!input || !input.trim()) return '';
            return parseBlocks(input);
        }
    };
})();

window.MarkdownParser = MarkdownParser;
