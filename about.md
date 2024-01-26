# Blockbench Outliner XPath API

The **Blockbench Outliner XPath API** adds the functions to Outliner instace to search Outliner Nodes with XPath.

With the addition of this function, the functions to snapshot Outliner as DOM and to retrieve OutlinerNode instances by UUID are also added.

Added Properties
| Property                 | Type                             | Description                                                  |
| ------------------------ | -------------------------------- | ------------------------------------------------------------ |
| `Outliner.allNodes`      | OutlinerNode[]                   | Lists all Nodes on Outliner as an array. The difference between `Outliner.elements` is this includes `Group` nodes. |
| `Outliner.allNodesIdMap` | `{[uuid: string]: OutlinerNode}` | Lists all nodes on Outliner as an uuid-keyed dictionary. This mapped `Outliner.allNodes` contents by its uuid. |
| `Outliner.domImage`      | Document                         | Provides snapshot of Outliner contents as DOM.               |

Added Functions

| Function                                                     | Returns                                          | Description                                                  |
| ------------------------------------------------------------ | ------------------------------------------------ | ------------------------------------------------------------ |
| `Outliner.getNodeById(id: string): OutlinerNode`             | OutlinerNode                                     | Retrieves an element with given uuid.                        |
| `Outliner.evaluate(xpath: string, context?: OutlinerNode \| string)` | OutlinerNode[] \|<br />OutlinerNode \|<br />null | Provides a function that allows us to search OutlinerNode(s) by XPath.<br/>It returns OutlinerNode Array if results multiple, OutlinerNode if results singular or null if results none. |

