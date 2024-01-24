declare namespace Outliner {

    /** Outliner.getNodeById retrieves an element with given uuid. 
     * @param id UUID of target node
     */
    function getNodeById(id: string): OutlinerNode;

    /**
     * Outliner.evaluate provides a function that allows us to search OutlinerNode(s) by XPath.
     * It returns OutlinerNode Array if results multiple, OutlinerNode if results singular or null if results none.
     * @param xpath XPath String
     * @param context Context OutlinerNode or UUID to evaluate XPath. If null or not use context will be virtual parent of Outliner.root.
     */
    function evaluate(xpath: string, context?: OutlinerNode | String): OutlinerNode[] | OutlinerNode | null;
}

declare class Outliner {
    /** Outliner.allNodes lists all Nodes on Outliner as an array. The difference between Outliner.elements is this includes Group nodes.*/
    static get allNodes(): OutlinerNode[];
    /** Outliner.allNodesIdMap lists all nodes on Outliner as an uuid-keyed dictionary. This mapped Outliner.allNodes contents by its uuid. */
    static get allNodesIdMap(): { [uuid: string]: OutlinerNode };
    /** Outliner.domImage provides snapshot of Outliner contents as DOM. */
    static get domImage(): Document;
}