// Kiểm tra commit message theo Conventional Commits — chạy bởi hook commit-msg.
// Format: <type>(<scope>)?: <mô tả ≤ 72 ký tự, không viết hoa chữ đầu, không chấm cuối>
import { readFileSync } from "node:fs";

const msgFile = process.argv[2];
const firstLine = readFileSync(msgFile, "utf8").split("\n")[0].trim();

// Cho qua các message do git tự sinh
if (/^(Merge|Revert|fixup!|squash!)/.test(firstLine)) process.exit(0);

const TYPES = ["feat", "fix", "refactor", "style", "docs", "chore", "perf", "test"];
const match = firstLine.match(/^([a-zA-Z]+)(\(([^)]*)\))?(!)?(: ?)?(.*)$/);
const [, type, , scope, , sep, desc = ""] = match ?? [];

const errors = [];
if (!type || !TYPES.includes(type)) errors.push(`type phải là: ${TYPES.join(" | ")}`);
if (scope !== undefined && !/^[a-z0-9-]+$/.test(scope)) errors.push("scope viết thường, chỉ gồm a-z, 0-9, dấu gạch ngang");
if (sep !== ": ") errors.push('sau type(scope) phải là ": " (hai chấm + khoảng trắng)');
if (!desc) errors.push("thiếu mô tả");
if (/^[A-ZĐÂĂÊÔƠƯ]/.test(desc)) errors.push("mô tả không viết hoa chữ đầu");
if (desc.endsWith(".")) errors.push("mô tả không kết thúc bằng dấu chấm");
if (desc.length > 72) errors.push(`mô tả quá dài (${desc.length}/72 ký tự)`);

if (errors.length) {
  console.error("\n✖ Commit message không đúng quy tắc (README.md mục 5):\n");
  console.error(`  "${firstLine}"\n`);
  for (const e of errors) console.error(`  - ${e}`);
  console.error("\n  Ví dụ hợp lệ:  feat(admin): them trang tong quan voi mock data\n");
  process.exit(1);
}
process.exit(0);
