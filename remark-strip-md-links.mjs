import { visit } from "unist-util-visit";

export default function remarkStripMdLinks() {
  return (tree) => {
    visit(tree, "link", (node) => {
      if (typeof node.url !== "string") return;

      // Only touch relative links that end in `.md`
      // Handles optional anchors: foo.md#bar
      if (
        node.url.startsWith("./") ||
        node.url.startsWith("../") ||
        !node.url.includes("://")
      ) {
        node.url = node.url.replace(/\.md(?=$|#)/, "");
      }
    });
  };
}
