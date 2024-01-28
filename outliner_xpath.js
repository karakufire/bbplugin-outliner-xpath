/// <reference path="outliner_xpath.d.ts" />

(function () {
    /**
     * @private
     * @param {OutlinerNode} node 
     * @param {Document} doc 
     */
    function toDOM(node, doc) {
        if (!(doc instanceof Document)) throw new TypeError("doc should be Document instance");
        if (!(node instanceof OutlinerNode)) throw new TypeError("node should be OutlinerNode instance");
        const elem = doc.createElement(`${node.name}`);

        const type = doc.createAttribute("type");
        type.value = `${node.constructor.name}`;
        elem.setAttributeNode(type);

        /**
         * 
         * @param {string} name 
         * @param {string} alt 
         */
        const setAttributeIfExists = (name, alt) => {
            if (node[name] != null) {
                const attr = doc.createAttribute(alt || name);
                attr.value = `${node[name]}`;
                elem.setAttributeNode(attr);
            };
        }

        /**
         * 
         * @param {string} name 
         * @param {string} alt 
         */
        const setVec2ArrAttributeIfExists = (name, alt) => {
            if (node[name] instanceof Array && node[name].length == 2) {
                const attr = doc.createAttribute(alt || name);
                attr.value = JSON.stringify(node[name]);
                elem.setAttributeNode(attr);
            }
        };

        /**
         * 
         * @param {string} name 
         * @param {string} alt 
         */
        const setVec3ArrAttributeIfExists = (name, alt) => {
            if (node[name] instanceof Array && node[name].length == 3) {
                const attr = doc.createAttribute(alt || name);
                attr.value = JSON.stringify(node[name]);
                elem.setAttributeNode(attr);
            }
        };

        setAttributeIfExists("uuid", "id");
        setAttributeIfExists("name");
        setAttributeIfExists("export");
        setAttributeIfExists("locked");

        setAttributeIfExists("visibility");
        setVec3ArrAttributeIfExists("position");

        setVec3ArrAttributeIfExists("origin");
        setVec3ArrAttributeIfExists("from");
        setVec3ArrAttributeIfExists("to");
        setVec3ArrAttributeIfExists("rotation");
        setVec3ArrAttributeIfExists("scale");

        setVec2ArrAttributeIfExists("uv_offset")
        setAttributeIfExists("shade");
        setAttributeIfExists("mirror_uv");
        setAttributeIfExists("inflate");
        setAttributeIfExists("color");
        if (node["from"] instanceof Array && node["to"] instanceof Array && node["from"].length == 3 && node["to"].length == 3) {
            const sAttr = doc.createAttribute("size");
            const size = [node["to"][0] - node["from"][0], node["to"][1] - node["from"][1], node["to"][2] - node["from"][2]].map(Math.abs);
            sAttr.value = JSON.stringify(size);
            elem.setAttributeNode(sAttr);
        }

        if (node instanceof Group) {
            node.children.map(e => toDOM(e, doc)).forEach(e => elem.appendChild(e));
        }

        return elem;
    }


    BBPlugin.register('outliner_xpath', {
        title: 'Blockbench Outliner XPath API',
        author: 'karakufire',
        icon: "icon.svg",
        description: 'Provides an API what allows us to retrieve outliner-node(s) with x-path. This aims to help such as batch processing of outliner-nodes that match the criteria.',
        about: [
            "**Blockbench Outliner XPath API** adds the functions to Outliner instace to search Outliner Nodes with XPath.",
            "With the addition of this function, the functions to snapshot Outliner as DOM and to retrieve OutlinerNode instances by UUID are also added.",
            "Because this plugin is focused to add those console functions, this plugin will not add any actions evoked via user interface."
        ].join("<br>"),
        version: '1.1.0',
        variant: 'both',
        onload() {
            Object.defineProperty(Outliner, 'allNodes', {
                configurable: true,
                get: function () {
                    const all = [];
                    function pick(array) {
                        if (!(array instanceof Array)) return [];
                        const buffer = [];
                        for (let elem of array) {
                            if (elem instanceof OutlinerNode) {
                                buffer.safePush(elem);
                            }
                            if (elem instanceof Group) {
                                buffer.safePush(...pick(elem.children));
                            }
                        }
                        return buffer;
                    }
                    all.safePush(...pick(Outliner.root));
                    return [...all];
                }
            });

            Object.defineProperty(Outliner, 'allNodesIdMap', {
                configurable: true,
                get: function () {
                    return Outliner.allNodes.reduce((a, v, i) => ({ ...a, [v.uuid]: v }), {});
                }
            });

            Outliner.getNodeById = function (id) {
                if (typeof id === "string") return Outliner.allNodesIdMap[id];
            }

            Outliner.evaluate = function (xpath, context) {
                const eval = /** @param {string} path @return XPathResult*/ (path) => Outliner.domImage.evaluate(path, Outliner.domImage);
                let /** @type Node */ contextNode;
                if (context instanceof OutlinerNode)
                    contextNode = eval(`//*[@id="${context.uuid}"]`).iterateNext();
                else if (context === Outliner.root)
                    contextNode = eval("/root").iterateNext();
                else if (/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i.test(context))
                    contextNode = eval(`//*[@id="${context}"]`).iterateNext();
                else if (context == null || context === Outliner)
                    contextNode = Outliner.domImage;
                else throw new TypeError("Illegal context given. context should be OutlinerNode instance, Outliner, Outliner.root or uuid string.");

                const givenXPath = new XPathEvaluator().createExpression(xpath);
                const result = givenXPath.evaluate(contextNode);
                const /** @type string[] */ ids = [];
                for (let node = result.iterateNext(); node != null; node = result.iterateNext()) {
                    node.id && ids.push(node.id);
                }
                if (ids.length > 1) return [...ids.map(i => Outliner.allNodesIdMap[i])];
                else if (ids.length == 1) return Outliner.allNodesIdMap[ids[0]];
                else return null;
            }

            Object.defineProperty(Outliner, 'domImage', {
                configurable: true,
                get: function () {
                    const dom = new Document();
                    const root = dom.createElement("root");
                    Outliner.root.map(n => toDOM(n, dom)).forEach(e => root.appendChild(e));
                    dom.appendChild(root);
                    return dom;
                }
            });
        },
        onunload() {
            delete Outliner.allNodes;
            delete Outliner.allNodesIdMap;
            delete Outliner.getNodeById;
            delete Outliner.evaluate;
            delete Outliner.domImage;
            delete toDOM;
        }
    });
})();

