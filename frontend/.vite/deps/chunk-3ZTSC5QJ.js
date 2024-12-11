import {
  ConfigContext,
  LayoutContext,
  Sider_default,
  _toConsumableArray,
  omit,
  style_default
} from "./chunk-FOAB224S.js";
import {
  require_classnames,
  require_react_is
} from "./chunk-3WSECTTP.js";
import {
  require_react
} from "./chunk-WNPTCGAH.js";
import {
  __toESM
} from "./chunk-5WRI5ZAA.js";

// node_modules/antd/es/layout/layout.js
var React2 = __toESM(require_react());
var import_classnames = __toESM(require_classnames());

// node_modules/rc-util/es/Children/toArray.js
var import_react = __toESM(require_react());
var import_react_is = __toESM(require_react_is());
function toArray(children) {
  var option = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
  var ret = [];
  import_react.default.Children.forEach(children, function(child) {
    if ((child === void 0 || child === null) && !option.keepEmpty) {
      return;
    }
    if (Array.isArray(child)) {
      ret = ret.concat(toArray(child));
    } else if ((0, import_react_is.isFragment)(child) && child.props) {
      ret = ret.concat(toArray(child.props.children, option));
    } else {
      ret.push(child);
    }
  });
  return ret;
}

// node_modules/antd/es/layout/hooks/useHasSider.js
function useHasSider(siders, children, hasSider) {
  if (typeof hasSider === "boolean") {
    return hasSider;
  }
  if (siders.length) {
    return true;
  }
  const childNodes = toArray(children);
  return childNodes.some((node) => node.type === Sider_default);
}

// node_modules/antd/es/layout/layout.js
var __rest = function(s, e) {
  var t = {};
  for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0) t[p] = s[p];
  if (s != null && typeof Object.getOwnPropertySymbols === "function") for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
    if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i])) t[p[i]] = s[p[i]];
  }
  return t;
};
function generator(_ref) {
  let {
    suffixCls,
    tagName,
    displayName
  } = _ref;
  return (BasicComponent) => {
    const Adapter = React2.forwardRef((props, ref) => React2.createElement(BasicComponent, Object.assign({
      ref,
      suffixCls,
      tagName
    }, props)));
    if (true) {
      Adapter.displayName = displayName;
    }
    return Adapter;
  };
}
var Basic = React2.forwardRef((props, ref) => {
  const {
    prefixCls: customizePrefixCls,
    suffixCls,
    className,
    tagName: TagName
  } = props, others = __rest(props, ["prefixCls", "suffixCls", "className", "tagName"]);
  const {
    getPrefixCls
  } = React2.useContext(ConfigContext);
  const prefixCls = getPrefixCls("layout", customizePrefixCls);
  const [wrapSSR, hashId, cssVarCls] = style_default(prefixCls);
  const prefixWithSuffixCls = suffixCls ? `${prefixCls}-${suffixCls}` : prefixCls;
  return wrapSSR(React2.createElement(TagName, Object.assign({
    className: (0, import_classnames.default)(customizePrefixCls || prefixWithSuffixCls, className, hashId, cssVarCls),
    ref
  }, others)));
});
var BasicLayout = React2.forwardRef((props, ref) => {
  const {
    direction
  } = React2.useContext(ConfigContext);
  const [siders, setSiders] = React2.useState([]);
  const {
    prefixCls: customizePrefixCls,
    className,
    rootClassName,
    children,
    hasSider,
    tagName: Tag,
    style
  } = props, others = __rest(props, ["prefixCls", "className", "rootClassName", "children", "hasSider", "tagName", "style"]);
  const passedProps = omit(others, ["suffixCls"]);
  const {
    getPrefixCls,
    layout
  } = React2.useContext(ConfigContext);
  const prefixCls = getPrefixCls("layout", customizePrefixCls);
  const mergedHasSider = useHasSider(siders, children, hasSider);
  const [wrapCSSVar, hashId, cssVarCls] = style_default(prefixCls);
  const classString = (0, import_classnames.default)(prefixCls, {
    [`${prefixCls}-has-sider`]: mergedHasSider,
    [`${prefixCls}-rtl`]: direction === "rtl"
  }, layout === null || layout === void 0 ? void 0 : layout.className, className, rootClassName, hashId, cssVarCls);
  const contextValue = React2.useMemo(() => ({
    siderHook: {
      addSider: (id) => {
        setSiders((prev) => [].concat(_toConsumableArray(prev), [id]));
      },
      removeSider: (id) => {
        setSiders((prev) => prev.filter((currentId) => currentId !== id));
      }
    }
  }), []);
  return wrapCSSVar(React2.createElement(LayoutContext.Provider, {
    value: contextValue
  }, React2.createElement(Tag, Object.assign({
    ref,
    className: classString,
    style: Object.assign(Object.assign({}, layout === null || layout === void 0 ? void 0 : layout.style), style)
  }, passedProps), children)));
});
var Layout = generator({
  tagName: "div",
  displayName: "Layout"
})(BasicLayout);
var Header = generator({
  suffixCls: "header",
  tagName: "header",
  displayName: "Header"
})(Basic);
var Footer = generator({
  suffixCls: "footer",
  tagName: "footer",
  displayName: "Footer"
})(Basic);
var Content = generator({
  suffixCls: "content",
  tagName: "main",
  displayName: "Content"
})(Basic);
var layout_default = Layout;

export {
  toArray,
  Header,
  Footer,
  Content,
  layout_default
};
//# sourceMappingURL=chunk-3ZTSC5QJ.js.map
