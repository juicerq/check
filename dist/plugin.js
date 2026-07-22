import { noConditionalLet } from "./rules/no-conditional-let/rule.js";
import { noTernaryReturn } from "./rules/no-ternary-return/rule.js";
import { noTrivialCallWrapper } from "./rules/no-trivial-call-wrapper/rule.js";
// oxlint-disable-next-line import/no-default-export -- oxlint loads a JS plugin through its default export
export default {
    meta: { name: "juicerq" },
    rules: {
        "no-conditional-let": noConditionalLet,
        "no-ternary-return": noTernaryReturn,
        "no-trivial-call-wrapper": noTrivialCallWrapper,
    },
};
