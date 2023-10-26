export function grabAllTextNodes (node, allText) {
  const childNodes = node.childNodes
  let length = childNodes.length
  let subnode
  let nodeType
  while (length--) {
    subnode = childNodes[length]
    nodeType = subnode.nodeType
    if (nodeType === 3) {
      allText.push(subnode)
    } else if (
      nodeType === 1 &&
      !('ownerSVGElement' in subnode) &&
      !/^(?:iframe|noframes|noscript|script|select|style|textarea|code|pre)$/i.test(
        subnode.nodeName
      )
    ) {
      grabAllTextNodes(subnode, allText)
    }
  }
  return allText
}
