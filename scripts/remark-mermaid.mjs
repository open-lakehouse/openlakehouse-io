// Turn ```mermaid fences into <Mermaid chart="..."> before rehype-pretty-code
// highlights them as code. The component renders the diagram in the browser and
// keeps the source as text in prerendered HTML.
export default function remarkMermaid() {
  const walk = (node) => {
    if (!node.children) return;
    node.children = node.children.map((child) => {
      if (child.type === "code" && child.lang === "mermaid") {
        return {
          type: "mdxJsxFlowElement",
          name: "Mermaid",
          attributes: [{ type: "mdxJsxAttribute", name: "chart", value: child.value }],
          children: [],
        };
      }
      walk(child);
      return child;
    });
  };
  return walk;
}
