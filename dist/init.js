const { Fragment: e, Teleport: t, computed: n, createBlock: r, createCommentVNode: i, createElementBlock: a, createElementVNode: o, createTextVNode: s, createVNode: c, defineComponent: l, h: u, mergeModels: d, nextTick: f, normalizeClass: p, onMounted: m, openBlock: h, reactive: g, ref: _, renderList: v, resolveComponent: y, toDisplayString: b, unref: x, useModel: S, vModelCheckbox: C, vModelDynamic: w, vModelSelect: ee, vModelText: T, vShow: te, watch: E, withCtx: ne, withDirectives: D, withKeys: O, withModifiers: re } = window.__invoiceshelf_vue;
//#region resources/js/api.ts
var k = {
	adminCapabilities: "/api/v1/ai/admin-capabilities",
	capabilities: "/api/v1/ai/capabilities",
	drivers: "/api/v1/ai/drivers",
	globalConfig: "/api/v1/ai/config",
	globalTest: "/api/v1/ai/test",
	globalModels: "/api/v1/ai/models",
	companyConfig: "/api/v1/company/ai/config",
	companyTest: "/api/v1/company/ai/test",
	companyModels: "/api/v1/company/ai/models",
	scheduledTasks: "/api/v1/company/ai/scheduled-tasks",
	scheduledTask: (e) => `/api/v1/company/ai/scheduled-tasks/${e}`,
	scheduledTaskRun: (e) => `/api/v1/company/ai/scheduled-tasks/${e}/run`,
	chat: "/api/v1/ai/chat",
	conversations: "/api/v1/ai/conversations",
	conversation: (e) => `/api/v1/ai/conversations/${e}`,
	generate: "/api/v1/ai/generate"
};
//#endregion
//#region node_modules/.pnpm/dompurify@3.4.13/node_modules/dompurify/dist/purify.es.mjs
function ie(e, t) {
	(t == null || t > e.length) && (t = e.length);
	for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
	return r;
}
function A(e) {
	if (Array.isArray(e)) return e;
}
function ae(e, t) {
	var n = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
	if (n != null) {
		var r, i, a, o, s = [], c = !0, l = !1;
		try {
			if (a = (n = n.call(e)).next, t !== 0) for (; !(c = (r = a.call(n)).done) && (s.push(r.value), s.length !== t); c = !0);
		} catch (e) {
			l = !0, i = e;
		} finally {
			try {
				if (!c && n.return != null && (o = n.return(), Object(o) !== o)) return;
			} finally {
				if (l) throw i;
			}
		}
		return s;
	}
}
function j() {
	throw TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function M(e, t) {
	return A(e) || ae(e, t) || N(e, t) || j();
}
function N(e, t) {
	if (e) {
		if (typeof e == "string") return ie(e, t);
		var n = {}.toString.call(e).slice(8, -1);
		return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? ie(e, t) : void 0;
	}
}
var oe = Object.entries, se = Object.setPrototypeOf, ce = Object.isFrozen, le = Object.getPrototypeOf, ue = Object.getOwnPropertyDescriptor, P = Object.freeze, F = Object.seal, I = Object.create, de = typeof Reflect < "u" && Reflect, fe = de.apply, pe = de.construct;
P ||= function(e) {
	return e;
}, F ||= function(e) {
	return e;
}, fe ||= function(e, t) {
	var n = [...arguments].slice(2);
	return e.apply(t, n);
}, pe ||= function(e) {
	return new e(...[...arguments].slice(1));
};
var me = H(Array.prototype.forEach), he = H(Array.prototype.lastIndexOf), ge = H(Array.prototype.pop), _e = H(Array.prototype.push), ve = H(Array.prototype.splice), ye = Array.isArray, be = H(String.prototype.toLowerCase), xe = H(String.prototype.toString), Se = H(String.prototype.match), Ce = H(String.prototype.replace), we = H(String.prototype.indexOf), Te = H(String.prototype.trim), L = H(Number.prototype.toString), Ee = H(Boolean.prototype.toString), R = typeof BigInt > "u" ? null : H(BigInt.prototype.toString), De = typeof Symbol > "u" ? null : H(Symbol.prototype.toString), z = H(Object.prototype.hasOwnProperty), B = H(Object.prototype.toString), V = H(RegExp.prototype.test), Oe = ke(TypeError);
function H(e) {
	return function(t) {
		t instanceof RegExp && (t.lastIndex = 0);
		var n = [...arguments].slice(1);
		return fe(e, t, n);
	};
}
function ke(e) {
	return function() {
		return pe(e, [...arguments]);
	};
}
function U(e, t) {
	let n = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : be;
	if (se && se(e, null), !ye(t)) return e;
	let r = t.length;
	for (; r--;) {
		let i = t[r];
		if (typeof i == "string") {
			let e = n(i);
			e !== i && (ce(t) || (t[r] = e), i = e);
		}
		e[i] = !0;
	}
	return e;
}
function Ae(e) {
	for (let t = 0; t < e.length; t++) z(e, t) || (e[t] = null);
	return e;
}
function W(e) {
	let t = I(null);
	for (let r of oe(e)) {
		var n = M(r, 2);
		let i = n[0], a = n[1];
		z(e, i) && (t[i] = ye(a) ? Ae(a) : a && typeof a == "object" && a.constructor === Object ? W(a) : a);
	}
	return t;
}
function je(e) {
	switch (typeof e) {
		case "string": return e;
		case "number": return L(e);
		case "boolean": return Ee(e);
		case "bigint": return R ? R(e) : "0";
		case "symbol": return De ? De(e) : "Symbol()";
		case "undefined": return B(e);
		case "function":
		case "object": {
			if (e === null) return B(e);
			let t = e, n = Me(t, "toString");
			if (typeof n == "function") {
				let e = n(t);
				return typeof e == "string" ? e : B(e);
			}
			return B(e);
		}
		default: return B(e);
	}
}
function Me(e, t) {
	for (; e !== null;) {
		let n = ue(e, t);
		if (n) {
			if (n.get) return H(n.get);
			if (typeof n.value == "function") return H(n.value);
		}
		e = le(e);
	}
	function n() {
		return null;
	}
	return n;
}
function Ne(e) {
	try {
		return V(e, ""), !0;
	} catch {
		return !1;
	}
}
var Pe = P(/* @__PURE__ */ "a.abbr.acronym.address.area.article.aside.audio.b.bdi.bdo.big.blink.blockquote.body.br.button.canvas.caption.center.cite.code.col.colgroup.content.data.datalist.dd.decorator.del.details.dfn.dialog.dir.div.dl.dt.element.em.fieldset.figcaption.figure.font.footer.form.h1.h2.h3.h4.h5.h6.head.header.hgroup.hr.html.i.img.input.ins.kbd.label.legend.li.main.map.mark.marquee.menu.menuitem.meter.nav.nobr.ol.optgroup.option.output.p.picture.pre.progress.q.rp.rt.ruby.s.samp.search.section.select.shadow.slot.small.source.spacer.span.strike.strong.style.sub.summary.sup.table.tbody.td.template.textarea.tfoot.th.thead.time.tr.track.tt.u.ul.var.video.wbr".split(".")), Fe = P(/* @__PURE__ */ "svg.a.altglyph.altglyphdef.altglyphitem.animatecolor.animatemotion.animatetransform.circle.clippath.defs.desc.ellipse.enterkeyhint.exportparts.filter.font.g.glyph.glyphref.hkern.image.inputmode.line.lineargradient.marker.mask.metadata.mpath.part.path.pattern.polygon.polyline.radialgradient.rect.stop.style.switch.symbol.text.textpath.title.tref.tspan.view.vkern".split(".")), Ie = P([
	"feBlend",
	"feColorMatrix",
	"feComponentTransfer",
	"feComposite",
	"feConvolveMatrix",
	"feDiffuseLighting",
	"feDisplacementMap",
	"feDistantLight",
	"feDropShadow",
	"feFlood",
	"feFuncA",
	"feFuncB",
	"feFuncG",
	"feFuncR",
	"feGaussianBlur",
	"feImage",
	"feMerge",
	"feMergeNode",
	"feMorphology",
	"feOffset",
	"fePointLight",
	"feSpecularLighting",
	"feSpotLight",
	"feTile",
	"feTurbulence"
]), Le = P([
	"animate",
	"color-profile",
	"cursor",
	"discard",
	"font-face",
	"font-face-format",
	"font-face-name",
	"font-face-src",
	"font-face-uri",
	"foreignobject",
	"hatch",
	"hatchpath",
	"mesh",
	"meshgradient",
	"meshpatch",
	"meshrow",
	"missing-glyph",
	"script",
	"set",
	"solidcolor",
	"unknown",
	"use"
]), Re = P(/* @__PURE__ */ "math.menclose.merror.mfenced.mfrac.mglyph.mi.mlabeledtr.mmultiscripts.mn.mo.mover.mpadded.mphantom.mroot.mrow.ms.mspace.msqrt.mstyle.msub.msup.msubsup.mtable.mtd.mtext.mtr.munder.munderover.mprescripts".split(".")), ze = P([
	"maction",
	"maligngroup",
	"malignmark",
	"mlongdiv",
	"mscarries",
	"mscarry",
	"msgroup",
	"mstack",
	"msline",
	"msrow",
	"semantics",
	"annotation",
	"annotation-xml",
	"mprescripts",
	"none"
]), Be = P(["#text"]), Ve = P(/* @__PURE__ */ "accept.action.align.alt.autocapitalize.autocomplete.autopictureinpicture.autoplay.background.bgcolor.border.capture.cellpadding.cellspacing.checked.cite.class.clear.color.cols.colspan.command.commandfor.controls.controlslist.coords.crossorigin.datetime.decoding.default.dir.disabled.disablepictureinpicture.disableremoteplayback.download.draggable.enctype.enterkeyhint.exportparts.face.for.headers.height.hidden.high.href.hreflang.id.inert.inputmode.integrity.ismap.kind.label.lang.list.loading.loop.low.max.maxlength.media.method.min.minlength.multiple.muted.name.nonce.noshade.novalidate.nowrap.open.optimum.part.pattern.placeholder.playsinline.popover.popovertarget.popovertargetaction.poster.preload.pubdate.radiogroup.readonly.rel.required.rev.reversed.role.rows.rowspan.spellcheck.scope.selected.shape.size.sizes.slot.span.srclang.start.src.srcset.step.style.summary.tabindex.title.translate.type.usemap.valign.value.width.wrap.xmlns".split(".")), He = P(/* @__PURE__ */ "accent-height.accumulate.additive.alignment-baseline.amplitude.ascent.attributename.attributetype.azimuth.basefrequency.baseline-shift.begin.bias.by.class.clip.clippathunits.clip-path.clip-rule.color.color-interpolation.color-interpolation-filters.color-profile.color-rendering.cx.cy.d.dx.dy.diffuseconstant.direction.display.divisor.dominant-baseline.dur.edgemode.elevation.end.exponent.fill.fill-opacity.fill-rule.filter.filterunits.flood-color.flood-opacity.font-family.font-size.font-size-adjust.font-stretch.font-style.font-variant.font-weight.fx.fy.g1.g2.glyph-name.glyphref.gradientunits.gradienttransform.height.href.id.image-rendering.in.in2.intercept.k.k1.k2.k3.k4.kerning.keypoints.keysplines.keytimes.lang.lengthadjust.letter-spacing.kernelmatrix.kernelunitlength.lighting-color.local.marker-end.marker-mid.marker-start.markerheight.markerunits.markerwidth.maskcontentunits.maskunits.max.mask.mask-type.media.method.mode.min.name.numoctaves.offset.operator.opacity.order.orient.orientation.origin.overflow.paint-order.path.pathlength.patterncontentunits.patterntransform.patternunits.points.preservealpha.preserveaspectratio.primitiveunits.r.rx.ry.radius.refx.refy.repeatcount.repeatdur.restart.result.rotate.scale.seed.shape-rendering.slope.specularconstant.specularexponent.spreadmethod.startoffset.stddeviation.stitchtiles.stop-color.stop-opacity.stroke-dasharray.stroke-dashoffset.stroke-linecap.stroke-linejoin.stroke-miterlimit.stroke-opacity.stroke.stroke-width.style.surfacescale.systemlanguage.tabindex.tablevalues.targetx.targety.transform.transform-origin.text-anchor.text-decoration.text-orientation.text-rendering.textlength.type.u1.u2.unicode.values.viewbox.visibility.version.vert-adv-y.vert-origin-x.vert-origin-y.width.word-spacing.wrap.writing-mode.xchannelselector.ychannelselector.x.x1.x2.xmlns.y.y1.y2.z.zoomandpan".split(".")), Ue = P(/* @__PURE__ */ "accent.accentunder.align.bevelled.close.columnalign.columnlines.columnspacing.columnspan.denomalign.depth.dir.display.displaystyle.encoding.fence.frame.height.href.id.largeop.length.linethickness.lquote.lspace.mathbackground.mathcolor.mathsize.mathvariant.maxsize.minsize.movablelimits.notation.numalign.open.rowalign.rowlines.rowspacing.rowspan.rspace.rquote.scriptlevel.scriptminsize.scriptsizemultiplier.selection.separator.separators.stretchy.subscriptshift.supscriptshift.symmetric.voffset.width.xmlns".split(".")), We = P([
	"xlink:href",
	"xml:id",
	"xlink:title",
	"xml:space",
	"xmlns:xlink"
]), Ge = F(/{{[\w\W]*|^[\w\W]*}}/g), Ke = F(/<%[\w\W]*|^[\w\W]*%>/g), qe = F(/\${[\w\W]*/g), Je = F(/^data-[\-\w.\u00B7-\uFFFF]+$/), Ye = F(/^aria-[\-\w]+$/), Xe = F(/^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp|matrix):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i), Ze = F(/^(?:\w+script|data):/i), Qe = F(/[\u0000-\u0020\u00A0\u1680\u180E\u2000-\u2029\u205F\u3000]/g), $e = F(/^html$/i), et = F(/^[a-z][.\w]*(-[.\w]+)+$/i), tt = F(/<[/\w!]/g), nt = F(/<[/\w]/g), rt = F(/<\/no(script|embed|frames)/i), it = F(/\/>/i), G = {
	element: 1,
	attribute: 2,
	text: 3,
	cdataSection: 4,
	entityReference: 5,
	entityNode: 6,
	processingInstruction: 7,
	comment: 8,
	document: 9,
	documentType: 10,
	documentFragment: 11,
	notation: 12
}, at = function() {
	return typeof window > "u" ? null : window;
}, ot = function(e, t) {
	if (typeof e != "object" || typeof e.createPolicy != "function") return null;
	let n = null, r = "data-tt-policy-suffix";
	t && t.hasAttribute(r) && (n = t.getAttribute(r));
	let i = "dompurify" + (n ? "#" + n : "");
	try {
		return e.createPolicy(i, {
			createHTML(e) {
				return e;
			},
			createScriptURL(e) {
				return e;
			}
		});
	} catch {
		return console.warn("TrustedTypes policy " + i + " could not be created."), null;
	}
}, st = function() {
	return {
		afterSanitizeAttributes: [],
		afterSanitizeElements: [],
		afterSanitizeShadowDOM: [],
		beforeSanitizeAttributes: [],
		beforeSanitizeElements: [],
		beforeSanitizeShadowDOM: [],
		uponSanitizeAttribute: [],
		uponSanitizeElement: [],
		uponSanitizeShadowNode: []
	};
}, ct = function(e, t, n, r) {
	return z(e, t) && ye(e[t]) ? U(r.base ? W(r.base) : {}, e[t], r.transform) : n;
};
function lt() {
	let e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : at(), t = (e) => lt(e);
	if (t.version = "3.4.13", t.removed = [], !e || !e.document || e.document.nodeType !== G.document || !e.Element) return t.isSupported = !1, t;
	let n = e.document, r = n, i = r.currentScript;
	e.DocumentFragment;
	let a = e.HTMLTemplateElement, o = e.Node, s = e.Element, c = e.NodeFilter;
	e.NamedNodeMap === void 0 && (e.NamedNodeMap || e.MozNamedAttrMap), e.HTMLFormElement;
	let l = e.DOMParser, u = e.trustedTypes, d = s.prototype, f = Me(d, "cloneNode"), p = Me(d, "remove"), m = Me(d, "nextSibling"), h = Me(d, "childNodes"), g = Me(d, "parentNode"), _ = Me(d, "shadowRoot"), v = Me(d, "attributes"), y = o && o.prototype ? Me(o.prototype, "nodeType") : null, b = o && o.prototype ? Me(o.prototype, "nodeName") : null, x = o && o.prototype ? Me(o.prototype, "ownerDocument") : null;
	if (typeof a == "function") {
		let e = n.createElement("template");
		e.content && e.content.ownerDocument && (n = e.content.ownerDocument);
	}
	let S, C = "", w, ee = !1, T = 0, te = function() {
		if (T > 0) throw Oe("A configured TRUSTED_TYPES_POLICY callback (createHTML or createScriptURL) must not call DOMPurify.sanitize, as that causes infinite recursion. Do not pass a policy whose callbacks wrap DOMPurify as TRUSTED_TYPES_POLICY; see the \"DOMPurify and Trusted Types\" section of the README.");
	}, E = function(e) {
		te(), T++;
		try {
			return S.createHTML(e);
		} finally {
			T--;
		}
	}, ne = function(e) {
		te(), T++;
		try {
			return S.createScriptURL(e);
		} finally {
			T--;
		}
	}, D = function() {
		return ee ||= (w = ot(u, i), !0), w;
	}, O = n, re = O.implementation, k = O.createNodeIterator, ie = O.createDocumentFragment, A = O.getElementsByTagName, ae = r.importNode, j = st();
	t.isSupported = typeof oe == "function" && typeof g == "function" && re && re.createHTMLDocument !== void 0;
	let M = Ge, N = Ke, se = qe, ce = Je, le = Ye, ue = Ze, de = Qe, fe = et, pe = Xe, L = null, Ee = U({}, [
		...Pe,
		...Fe,
		...Ie,
		...Re,
		...Be
	]), R = null, De = U({}, [
		...Ve,
		...He,
		...Ue,
		...We
	]), B = Object.seal(I(null, {
		tagNameCheck: {
			writable: !0,
			configurable: !1,
			enumerable: !0,
			value: null
		},
		attributeNameCheck: {
			writable: !0,
			configurable: !1,
			enumerable: !0,
			value: null
		},
		allowCustomizedBuiltInElements: {
			writable: !0,
			configurable: !1,
			enumerable: !0,
			value: !1
		}
	})), H = null, ke = null, Ae = Object.seal(I(null, {
		tagCheck: {
			writable: !0,
			configurable: !1,
			enumerable: !0,
			value: null
		},
		attributeCheck: {
			writable: !0,
			configurable: !1,
			enumerable: !0,
			value: null
		}
	})), ut = !0, dt = !0, ft = !1, pt = !0, K = !1, q = !0, J = !1, mt = !1, Y = null, ht = null, gt = !1, _t = !1, vt = !1, yt = !1, bt = !0, xt = !1, St = "user-content-", Ct = !0, wt = !1, Tt = {}, X = null, Et = U({}, /* @__PURE__ */ "annotation-xml.audio.colgroup.desc.foreignobject.head.iframe.math.mi.mn.mo.ms.mtext.noembed.noframes.noscript.plaintext.script.selectedcontent.style.svg.template.thead.title.video.xmp".split(".")), Dt = null, Ot = U({}, [
		"audio",
		"video",
		"img",
		"source",
		"image",
		"track"
	]), kt = null, At = U({}, [
		"alt",
		"class",
		"for",
		"id",
		"label",
		"name",
		"pattern",
		"placeholder",
		"role",
		"summary",
		"title",
		"value",
		"style",
		"xmlns"
	]), jt = "http://www.w3.org/1998/Math/MathML", Mt = "http://www.w3.org/2000/svg", Nt = "http://www.w3.org/1999/xhtml", Pt = Nt, Ft = !1, It = null, Lt = U({}, [
		jt,
		Mt,
		Nt
	], xe), Rt = P([
		"mi",
		"mo",
		"mn",
		"ms",
		"mtext"
	]), zt = U({}, Rt), Bt = P(["annotation-xml"]), Vt = U({}, Bt), Ht = U({}, [
		"title",
		"style",
		"font",
		"a",
		"script"
	]), Ut = null, Wt = ["application/xhtml+xml", "text/html"], Z = null, Gt = null, Kt = n.createElement("form"), qt = function(e) {
		return e instanceof RegExp || e instanceof Function;
	}, Jt = function() {
		let e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
		if (Gt && Gt === e) return;
		(!e || typeof e != "object") && (e = {}), e = W(e), Ut = Wt.indexOf(e.PARSER_MEDIA_TYPE) === -1 ? "text/html" : e.PARSER_MEDIA_TYPE, Z = Ut === "application/xhtml+xml" ? xe : be, L = ct(e, "ALLOWED_TAGS", Ee, { transform: Z }), R = ct(e, "ALLOWED_ATTR", De, { transform: Z }), It = ct(e, "ALLOWED_NAMESPACES", Lt, { transform: xe }), kt = ct(e, "ADD_URI_SAFE_ATTR", At, {
			transform: Z,
			base: At
		}), Dt = ct(e, "ADD_DATA_URI_TAGS", Ot, {
			transform: Z,
			base: Ot
		}), X = ct(e, "FORBID_CONTENTS", Et, { transform: Z }), H = ct(e, "FORBID_TAGS", W({}), { transform: Z }), ke = ct(e, "FORBID_ATTR", W({}), { transform: Z }), Tt = z(e, "USE_PROFILES") ? e.USE_PROFILES && typeof e.USE_PROFILES == "object" ? W(e.USE_PROFILES) : e.USE_PROFILES : !1, ut = e.ALLOW_ARIA_ATTR !== !1, dt = e.ALLOW_DATA_ATTR !== !1, ft = e.ALLOW_UNKNOWN_PROTOCOLS || !1, pt = e.ALLOW_SELF_CLOSE_IN_ATTR !== !1, K = e.SAFE_FOR_TEMPLATES || !1, q = e.SAFE_FOR_XML !== !1, J = e.WHOLE_DOCUMENT || !1, _t = e.RETURN_DOM || !1, vt = e.RETURN_DOM_FRAGMENT || !1, yt = e.RETURN_TRUSTED_TYPE || !1, gt = e.FORCE_BODY || !1, bt = e.SANITIZE_DOM !== !1, xt = e.SANITIZE_NAMED_PROPS || !1, Ct = e.KEEP_CONTENT !== !1, wt = e.IN_PLACE || !1, pe = Ne(e.ALLOWED_URI_REGEXP) ? e.ALLOWED_URI_REGEXP : Xe, Pt = typeof e.NAMESPACE == "string" ? e.NAMESPACE : Nt, zt = z(e, "MATHML_TEXT_INTEGRATION_POINTS") && e.MATHML_TEXT_INTEGRATION_POINTS && typeof e.MATHML_TEXT_INTEGRATION_POINTS == "object" ? W(e.MATHML_TEXT_INTEGRATION_POINTS) : U({}, Rt), Vt = z(e, "HTML_INTEGRATION_POINTS") && e.HTML_INTEGRATION_POINTS && typeof e.HTML_INTEGRATION_POINTS == "object" ? W(e.HTML_INTEGRATION_POINTS) : U({}, Bt);
		let t = z(e, "CUSTOM_ELEMENT_HANDLING") && e.CUSTOM_ELEMENT_HANDLING && typeof e.CUSTOM_ELEMENT_HANDLING == "object" ? W(e.CUSTOM_ELEMENT_HANDLING) : I(null);
		if (B = I(null), z(t, "tagNameCheck") && qt(t.tagNameCheck) && (B.tagNameCheck = t.tagNameCheck), z(t, "attributeNameCheck") && qt(t.attributeNameCheck) && (B.attributeNameCheck = t.attributeNameCheck), z(t, "allowCustomizedBuiltInElements") && typeof t.allowCustomizedBuiltInElements == "boolean" && (B.allowCustomizedBuiltInElements = t.allowCustomizedBuiltInElements), F(B), K && (dt = !1), vt && (_t = !0), Tt && (L = U({}, Be), R = I(null), Tt.html === !0 && (U(L, Pe), U(R, Ve)), Tt.svg === !0 && (U(L, Fe), U(R, He), U(R, We)), Tt.svgFilters === !0 && (U(L, Ie), U(R, He), U(R, We)), Tt.mathMl === !0 && (U(L, Re), U(R, Ue), U(R, We))), Ae.tagCheck = null, Ae.attributeCheck = null, z(e, "ADD_TAGS") && (typeof e.ADD_TAGS == "function" ? Ae.tagCheck = e.ADD_TAGS : ye(e.ADD_TAGS) && (L === Ee && (L = W(L)), U(L, e.ADD_TAGS, Z))), z(e, "ADD_ATTR") && (typeof e.ADD_ATTR == "function" ? Ae.attributeCheck = e.ADD_ATTR : ye(e.ADD_ATTR) && (R === De && (R = W(R)), U(R, e.ADD_ATTR, Z))), z(e, "ADD_URI_SAFE_ATTR") && ye(e.ADD_URI_SAFE_ATTR) && U(kt, e.ADD_URI_SAFE_ATTR, Z), z(e, "FORBID_CONTENTS") && ye(e.FORBID_CONTENTS) && (X === Et && (X = W(X)), U(X, e.FORBID_CONTENTS, Z)), z(e, "ADD_FORBID_CONTENTS") && ye(e.ADD_FORBID_CONTENTS) && (X === Et && (X = W(X)), U(X, e.ADD_FORBID_CONTENTS, Z)), Ct && (L["#text"] = !0), J && U(L, [
			"html",
			"head",
			"body"
		]), L.table && (U(L, ["tbody"]), delete H.tbody), e.TRUSTED_TYPES_POLICY) {
			if (typeof e.TRUSTED_TYPES_POLICY.createHTML != "function") throw Oe("TRUSTED_TYPES_POLICY configuration option must provide a \"createHTML\" hook.");
			if (typeof e.TRUSTED_TYPES_POLICY.createScriptURL != "function") throw Oe("TRUSTED_TYPES_POLICY configuration option must provide a \"createScriptURL\" hook.");
			let t = S;
			S = e.TRUSTED_TYPES_POLICY;
			try {
				C = E("");
			} catch (e) {
				throw S = t, e;
			}
		} else e.TRUSTED_TYPES_POLICY === null ? (S = void 0, C = "") : (S === void 0 && (S = D()), S && typeof C == "string" && (C = E("")));
		P && P(e), Gt = e;
	}, Yt = U({}, [
		...Fe,
		...Ie,
		...Le
	]), Xt = U({}, [...Re, ...ze]), Zt = function(e, t, n) {
		return t.namespaceURI === Nt ? e === "svg" : t.namespaceURI === jt ? e === "svg" && (n === "annotation-xml" || zt[n]) : !!Yt[e];
	}, Qt = function(e, t, n) {
		return t.namespaceURI === Nt ? e === "math" : t.namespaceURI === Mt ? e === "math" && Vt[n] : !!Xt[e];
	}, $t = function(e, t, n) {
		return t.namespaceURI === Mt && !Vt[n] || t.namespaceURI === jt && !zt[n] ? !1 : !Xt[e] && (Ht[e] || !Yt[e]);
	}, en = function(e) {
		let t = g(e);
		(!t || !t.tagName) && (t = {
			namespaceURI: Pt,
			tagName: "template"
		});
		let n = be(e.tagName), r = be(t.tagName);
		return It[e.namespaceURI] ? e.namespaceURI === Mt ? Zt(n, t, r) : e.namespaceURI === jt ? Qt(n, t, r) : e.namespaceURI === Nt ? $t(n, t, r) : !!(Ut === "application/xhtml+xml" && It[e.namespaceURI]) : !1;
	}, tn = function(e) {
		_e(t.removed, { element: e });
		try {
			g(e).removeChild(e);
		} catch {
			if (p(e), !g(e)) throw Oe("a node selected for removal could not be detached from its tree and cannot be safely returned; refusing to sanitize in place");
		}
	}, nn = function(e) {
		on(e);
		let t = h(e);
		if (t) {
			let e = [];
			me(t, (t) => {
				_e(e, t);
			}), me(e, (e) => {
				try {
					p(e);
				} catch {}
			});
		}
		let n = v(e);
		if (n) for (let t = n.length - 1; t >= 0; --t) {
			let r = n[t], i = r && r.name;
			if (typeof i == "string") try {
				e.removeAttribute(i);
			} catch {}
		}
	}, rn = function(e, n) {
		try {
			_e(t.removed, {
				attribute: n.getAttributeNode(e),
				from: n
			});
		} catch {
			_e(t.removed, {
				attribute: null,
				from: n
			});
		}
		if (n.removeAttribute(e), e === "is") if (_t || vt) try {
			tn(n);
		} catch {}
		else try {
			n.setAttribute(e, "");
		} catch {}
	}, an = function(e) {
		let t = v(e);
		if (t) for (let n = t.length - 1; n >= 0; --n) {
			let r = t[n], i = r && r.name;
			if (!(typeof i != "string" || R[Z(i)])) try {
				e.removeAttribute(i);
			} catch {}
		}
	}, on = function(e) {
		let t = [e];
		for (; t.length > 0;) {
			let e = t.pop();
			(y ? y(e) : e.nodeType) === G.element && an(e);
			let n = h(e);
			if (n) for (let e = n.length - 1; e >= 0; --e) t.push(n[e]);
		}
	}, sn = function(e) {
		if (!q) return;
		let t = [e];
		for (; t.length > 0;) {
			let e = t.pop(), n = y ? y(e) : e.nodeType;
			if (n === G.processingInstruction || n === G.comment && V(nt, e.data)) {
				try {
					p(e);
				} catch {}
				continue;
			}
			if (n === G.element) {
				let t = e, n = Z(b ? b(e) : e.nodeName);
				try {
					t.hasAttribute && t.hasAttribute("patchsrc") && t.removeAttribute("patchsrc"), t.hasAttribute && t.hasAttribute("for") && n !== "label" && n !== "output" && t.removeAttribute("for");
				} catch {}
			}
			let r = h(e);
			if (r) for (let e = r.length - 1; e >= 0; --e) t.push(r[e]);
		}
	}, cn = function(e) {
		let t = null, r = null;
		if (gt) e = "<remove></remove>" + e;
		else {
			let t = Se(e, /^[\r\n\t ]+/);
			r = t && t[0];
		}
		Ut === "application/xhtml+xml" && Pt === Nt && (e = "<html xmlns=\"http://www.w3.org/1999/xhtml\"><head></head><body>" + e + "</body></html>");
		let i = S ? E(e) : e;
		if (Pt === Nt) try {
			t = new l().parseFromString(i, Ut);
		} catch {}
		if (!t || !t.documentElement) {
			t = re.createDocument(Pt, "template", null);
			try {
				t.documentElement.innerHTML = Ft ? C : i;
			} catch {}
		}
		let a = t.body || t.documentElement;
		return e && r && a.insertBefore(n.createTextNode(r), a.childNodes[0] || null), Pt === Nt ? A.call(t, J ? "html" : "body")[0] : J ? t.documentElement : a;
	}, ln = function(e) {
		let t = x ? x(e) : e.ownerDocument;
		return k.call(t || e, e, c.SHOW_ELEMENT | c.SHOW_COMMENT | c.SHOW_TEXT | c.SHOW_PROCESSING_INSTRUCTION | c.SHOW_CDATA_SECTION, null);
	}, un = function(e) {
		return e = Ce(e, M, " "), e = Ce(e, N, " "), e = Ce(e, se, " "), e;
	}, dn = function(e) {
		e.normalize();
		let t = x ? x(e) : e.ownerDocument, n = k.call(t || e, e, c.SHOW_TEXT | c.SHOW_COMMENT | c.SHOW_CDATA_SECTION | c.SHOW_PROCESSING_INSTRUCTION, null), r = n.nextNode();
		for (; r;) r.data = un(r.data), r = n.nextNode();
		let i = e.querySelectorAll?.call(e, "template");
		i && me(i, (e) => {
			pn(e.content) && dn(e.content);
		});
	}, fn = function(e) {
		let t = b ? b(e) : null;
		return typeof t != "string" || Z(t) !== "form" ? !1 : typeof e.nodeName != "string" || typeof e.textContent != "string" || typeof e.removeChild != "function" || e.attributes !== v(e) || typeof e.removeAttribute != "function" || typeof e.setAttribute != "function" || typeof e.namespaceURI != "string" || typeof e.insertBefore != "function" || typeof e.hasChildNodes != "function" || e.nodeType !== y(e) || e.childNodes !== h(e);
	}, pn = function(e) {
		if (!y || typeof e != "object" || !e) return !1;
		try {
			return y(e) === G.documentFragment;
		} catch {
			return !1;
		}
	}, mn = function(e) {
		if (!y || typeof e != "object" || !e) return !1;
		try {
			return typeof y(e) == "number";
		} catch {
			return !1;
		}
	};
	function hn(e, n, r) {
		e.length !== 0 && me(e, (e) => {
			e.call(t, n, r, Gt);
		});
	}
	let gn = function(e, t) {
		return !!(q && e.hasChildNodes() && !mn(e.firstElementChild) && V(tt, e.textContent) && V(tt, e.innerHTML) || q && e.namespaceURI === Nt && t === "style" && mn(e.firstElementChild) || e.nodeType === G.processingInstruction || q && e.nodeType === G.comment && V(nt, e.data));
	}, _n = function(e, t, n) {
		if (!H[t] && Sn(t) && (B.tagNameCheck instanceof RegExp && V(B.tagNameCheck, t) || B.tagNameCheck instanceof Function && B.tagNameCheck(t))) return !1;
		if (Ct && !X[t]) {
			let t = g(e), r = h(e);
			if (r && t) {
				let i = r.length;
				for (let a = i - 1; a >= 0; --a) {
					let i = e === n ? f(r[a], !0) : r[a];
					t.insertBefore(i, m(e));
				}
			}
		}
		return tn(e), !0;
	}, vn = function(e, t, n, r) {
		return e.length === 0 ? t : t === n || t === r ? W(t) : t;
	}, yn = function(e, n) {
		if (hn(j.beforeSanitizeElements, e, null), e !== n && g(e) === null) return wt && on(e), !0;
		if (fn(e)) return tn(e), !0;
		let r = Z(b ? b(e) : e.nodeName);
		if (L = vn(j.uponSanitizeElement, L, Ee, Y), hn(j.uponSanitizeElement, e, {
			tagName: r,
			allowedTags: L
		}), e !== n && g(e) === null) return wt && on(e), !0;
		if (gn(e, r)) return tn(e), !0;
		if (H[r] || !(Ae.tagCheck instanceof Function && Ae.tagCheck(r)) && !L[r]) {
			let t = _n(e, r, n);
			return t === !1 && hn(j.afterSanitizeElements, e, null), t;
		}
		if ((y ? y(e) : e.nodeType) === G.element && !en(e) || (r === "noscript" || r === "noembed" || r === "noframes") && V(rt, e.innerHTML)) return tn(e), !0;
		if (K && e.nodeType === G.text) {
			let n = un(e.textContent);
			e.textContent !== n && (_e(t.removed, { element: e.cloneNode() }), e.textContent = n);
		}
		return hn(j.afterSanitizeElements, e, null), !1;
	}, bn = function(e, t, r) {
		if (ke[t] || q && t === "patchsrc" || q && t === "for" && e !== "label" && e !== "output" || bt && (t === "id" || t === "name") && (r in n || r in Kt)) return !1;
		let i = R[t] || Ae.attributeCheck instanceof Function && Ae.attributeCheck(t, e);
		if (!(dt && V(ce, t)) && !(ut && V(le, t))) {
			if (!i) {
				if (!(Sn(e) && (B.tagNameCheck instanceof RegExp && V(B.tagNameCheck, e) || B.tagNameCheck instanceof Function && B.tagNameCheck(e)) && (B.attributeNameCheck instanceof RegExp && V(B.attributeNameCheck, t) || B.attributeNameCheck instanceof Function && B.attributeNameCheck(t, e)) || t === "is" && B.allowCustomizedBuiltInElements && (B.tagNameCheck instanceof RegExp && V(B.tagNameCheck, r) || B.tagNameCheck instanceof Function && B.tagNameCheck(r)))) return !1;
			} else if (!kt[t] && !V(pe, Ce(r, de, "")) && !((t === "src" || t === "xlink:href" || t === "href") && e !== "script" && we(r, "data:") === 0 && Dt[e]) && !(ft && !V(ue, Ce(r, de, ""))) && r) return !1;
		}
		return !0;
	}, xn = U({}, [
		"annotation-xml",
		"color-profile",
		"font-face",
		"font-face-format",
		"font-face-name",
		"font-face-src",
		"font-face-uri",
		"missing-glyph"
	]), Sn = function(e) {
		return !xn[be(e)] && V(fe, e);
	}, Cn = function(e, t, n, r) {
		if (S && typeof u == "object" && typeof u.getAttributeType == "function" && !n) switch (u.getAttributeType(e, t)) {
			case "TrustedHTML": return E(r);
			case "TrustedScriptURL": return ne(r);
		}
		return r;
	}, wn = function(e, n, r, i) {
		try {
			r ? e.setAttributeNS(r, n, i) : e.setAttribute(n, i), fn(e) ? tn(e) : ge(t.removed);
		} catch {
			rn(n, e);
		}
	}, Tn = function(e) {
		hn(j.beforeSanitizeAttributes, e, null);
		let t = e.attributes;
		if (!t || fn(e)) return;
		R = vn(j.uponSanitizeAttribute, R, De, ht);
		let n = {
			attrName: "",
			attrValue: "",
			keepAttr: !0,
			allowedAttributes: R,
			forceKeepAttr: void 0
		}, r = t.length, i = Z(e.nodeName);
		for (; r--;) {
			let a = t[r], o = a.name, s = a.namespaceURI, c = a.value, l = Z(o), u = c, d = o === "value" ? u : Te(u);
			if (n.attrName = l, n.attrValue = d, n.keepAttr = !0, n.forceKeepAttr = void 0, hn(j.uponSanitizeAttribute, e, n), d = n.attrValue, xt && (l === "id" || l === "name") && we(d, St) !== 0 && (rn(o, e), d = St + d), q && V(/((--!?|])>)|<\/(style|script|title|xmp|textarea|noscript|iframe|noembed|noframes)/i, d)) {
				rn(o, e);
				continue;
			}
			if (l === "attributename" && Se(d, "href")) {
				rn(o, e);
				continue;
			}
			if (!n.forceKeepAttr) {
				if (!n.keepAttr) {
					rn(o, e);
					continue;
				}
				if (!pt && V(it, d)) {
					rn(o, e);
					continue;
				}
				if (K && (d = un(d)), !bn(i, l, d)) {
					rn(o, e);
					continue;
				}
				d = Cn(i, l, s, d), d !== u && wn(e, o, s, d);
			}
		}
		hn(j.afterSanitizeAttributes, e, null);
	}, En = function(e) {
		let t = null, n = ln(e);
		for (hn(j.beforeSanitizeShadowDOM, e, null); t = n.nextNode();) if (hn(j.uponSanitizeShadowNode, t, null), yn(t, e), Tn(t), pn(t.content) && En(t.content), (y ? y(t) : t.nodeType) === G.element) {
			let e = _(t);
			pn(e) && (Dn(e), En(e));
		}
		hn(j.afterSanitizeShadowDOM, e, null);
	}, Dn = function(e) {
		let t = [{
			node: e,
			shadow: null
		}];
		for (; t.length > 0;) {
			let e = t.pop();
			if (e.shadow) {
				En(e.shadow);
				continue;
			}
			let n = e.node, r = (y ? y(n) : n.nodeType) === G.element, i = h(n);
			if (i) for (let e = i.length - 1; e >= 0; --e) t.push({
				node: i[e],
				shadow: null
			});
			if (r) {
				let e = b ? b(n) : null;
				if (typeof e == "string" && Z(e) === "template") {
					let e = n.content;
					pn(e) && t.push({
						node: e,
						shadow: null
					});
				}
			}
			if (r) {
				let e = _(n);
				pn(e) && t.push({
					node: null,
					shadow: e
				}, {
					node: e,
					shadow: null
				});
			}
		}
	};
	return t.sanitize = function(e) {
		let n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, i = null, a = null, o = null, s = null;
		if (Ft = !e, Ft && (e = "<!-->"), typeof e != "string" && !mn(e) && (e = je(e), typeof e != "string")) throw Oe("dirty is not a string, aborting");
		if (!t.isSupported) return e;
		mt ? (L = Y, R = ht) : Jt(n), (j.uponSanitizeElement.length > 0 || j.uponSanitizeAttribute.length > 0) && (L = W(L)), j.uponSanitizeAttribute.length > 0 && (R = W(R)), t.removed = [];
		let c = wt && typeof e != "string" && mn(e);
		if (c) {
			sn(e);
			let t = b ? b(e) : e.nodeName;
			if (typeof t == "string") {
				let n = Z(t);
				if (!L[n] || H[n]) throw nn(e), Oe("root node is forbidden and cannot be sanitized in-place");
			}
			if (fn(e)) throw nn(e), Oe("root node is clobbered and cannot be sanitized in-place");
			try {
				Dn(e);
			} catch (t) {
				throw nn(e), t;
			}
		} else if (mn(e)) i = cn("<!---->"), a = i.ownerDocument.importNode(e, !0), a.nodeType === G.element && a.nodeName === "BODY" || a.nodeName === "HTML" ? i = a : i.appendChild(a), Dn(a);
		else {
			if (!_t && !K && !J && e.indexOf("<") === -1) return S && yt ? E(e) : e;
			if (i = cn(e), !i) return _t ? null : yt ? C : "";
		}
		i && gt && tn(i.firstChild);
		let l = c ? e : i;
		try {
			let e = ln(l);
			for (; o = e.nextNode();) yn(o, l), Tn(o), pn(o.content) && En(o.content);
		} catch (n) {
			throw c && (nn(e), me(t.removed, (e) => {
				e.element && on(e.element);
			})), n;
		}
		if (c) return me(t.removed, (e) => {
			e.element && on(e.element);
		}), K && dn(e), e;
		if (_t) {
			if (K && dn(i), vt) for (s = ie.call(i.ownerDocument); i.firstChild;) s.appendChild(i.firstChild);
			else s = i;
			return (R.shadowroot || R.shadowrootmode) && (s = ae.call(r, s, !0)), s;
		}
		let u = J ? i.outerHTML : i.innerHTML;
		return J && L["!doctype"] && i.ownerDocument && i.ownerDocument.doctype && i.ownerDocument.doctype.name && V($e, i.ownerDocument.doctype.name) && (u = "<!DOCTYPE " + i.ownerDocument.doctype.name + ">\n" + u), K && (u = un(u)), S && yt ? E(u) : u;
	}, t.setConfig = function() {
		let e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
		Jt(e), mt = !0, Y = L, ht = R;
	}, t.clearConfig = function() {
		Gt = null, mt = !1, Y = null, ht = null, S = w, C = "";
	}, t.isValidAttribute = function(e, t, n) {
		Gt || Jt({});
		let r = Z(e), i = Z(t);
		return bn(r, i, n);
	}, t.addHook = function(e, t) {
		typeof t == "function" && z(j, e) && _e(j[e], t);
	}, t.removeHook = function(e, t) {
		if (z(j, e)) {
			if (t !== void 0) {
				let n = he(j[e], t);
				return n === -1 ? void 0 : ve(j[e], n, 1)[0];
			}
			return ge(j[e]);
		}
	}, t.removeHooks = function(e) {
		z(j, e) && (j[e] = []);
	}, t.removeAllHooks = function() {
		j = st();
	}, t;
}
var ut = lt();
//#endregion
//#region node_modules/.pnpm/marked@18.0.9/node_modules/marked/lib/marked.esm.js
function dt() {
	return {
		async: !1,
		breaks: !1,
		extensions: null,
		gfm: !0,
		hooks: null,
		pedantic: !1,
		renderer: null,
		silent: !1,
		tokenizer: null,
		walkTokens: null
	};
}
var ft = dt();
function pt(e) {
	ft = e;
}
var K = { exec: () => null };
function q(e) {
	let t = [];
	return (n) => {
		let r = Math.max(0, Math.min(3, n - 1)), i = t[r];
		return i || (i = e(r), t[r] = i), i;
	};
}
function J(e, t = "") {
	let n = typeof e == "string" ? e : e.source, r = {
		replace: (e, t) => {
			let i = typeof t == "string" ? t : t.source;
			return i = i.replace(Y.caret, "$1"), n = n.replace(e, i), r;
		},
		getRegex: () => new RegExp(n, t)
	};
	return r;
}
var mt = ((e = "") => {
	try {
		return !!RegExp("(?<=1)(?<!1)" + e);
	} catch {
		return !1;
	}
})(), Y = {
	codeRemoveIndent: /^(?: {1,4}| {0,3}\t)/gm,
	outputLinkReplace: /\\([\[\]])/g,
	indentCodeCompensation: /^(\s+)(?:```)/,
	beginningSpace: /^\s+/,
	endingHash: /#$/,
	startingSpaceChar: /^ /,
	endingSpaceChar: / $/,
	nonSpaceChar: /[^ ]/,
	newLineCharGlobal: /\n/g,
	tabCharGlobal: /\t/g,
	multipleSpaceGlobal: /\s+/g,
	blankLine: /^[ \t]*$/,
	doubleBlankLine: /\n[ \t]*\n[ \t]*$/,
	blockquoteStart: /^ {0,3}>/,
	blockquoteSetextReplace: /\n {0,3}((?:=+|-+) *)(?=\n|$)/g,
	blockquoteSetextReplace2: /^ {0,3}>[ \t]?/gm,
	listReplaceNesting: /^ {1,4}(?=( {4})*[^ ])/g,
	listIsTask: /^\[[ xX]\] +\S/,
	listReplaceTask: /^\[[ xX]\] +/,
	listTaskCheckbox: /\[[ xX]\]/,
	anyLine: /\n.*\n/,
	hrefBrackets: /^<(.*)>$/,
	tableDelimiter: /[:|]/,
	tableAlignChars: /^\||\| *$/g,
	tableRowBlankLine: /\n[ \t]*$/,
	tableAlignRight: /^ *-+: *$/,
	tableAlignCenter: /^ *:-+: *$/,
	tableAlignLeft: /^ *:-+ *$/,
	startATag: /^<a /i,
	endATag: /^<\/a>/i,
	startPreScriptTag: /^<(pre|code|kbd|script)(\s|>)/i,
	endPreScriptTag: /^<\/(pre|code|kbd|script)(\s|>)/i,
	startAngleBracket: /^</,
	endAngleBracket: />$/,
	pedanticHrefTitle: /^([^'"]*[^\s])\s+(['"])(.*)\2/,
	unicodeAlphaNumeric: /[\p{L}\p{N}]/u,
	escapeTest: /[&<>"']/,
	escapeReplace: /[&<>"']/g,
	escapeTestNoEncode: /[<>"']|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/,
	escapeReplaceNoEncode: /[<>"']|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/g,
	caret: /(^|[^\[])\^/g,
	percentDecode: /%25/g,
	findPipe: /\|/g,
	splitPipe: / \|/,
	slashPipe: /\\\|/g,
	carriageReturn: /\r\n|\r/g,
	spaceLine: /^ +$/gm,
	notSpaceStart: /^\S*/,
	endingNewline: /\n$/,
	listItemRegex: (e) => RegExp(`^( {0,3}${e})((?:[	 ][^\\n]*)?(?:\\n|$))`),
	nextBulletRegex: q((e) => RegExp(`^ {0,${e}}(?:[*+-]|\\d{1,9}[.)])((?:[ 	][^\\n]*)?(?:\\n|$))`)),
	hrRegex: q((e) => RegExp(`^ {0,${e}}((?:- *){3,}|(?:_ *){3,}|(?:\\* *){3,})(?:\\n+|$)`)),
	fencesBeginRegex: q((e) => RegExp(`^ {0,${e}}(?:\`\`\`|~~~)`)),
	headingBeginRegex: q((e) => RegExp(`^ {0,${e}}#`)),
	htmlBeginRegex: q((e) => RegExp(`^ {0,${e}}<(?:[a-z].*>|!--)`, "i")),
	blockquoteBeginRegex: q((e) => RegExp(`^ {0,${e}}>`))
}, ht = /^(?:[ \t]*(?:\n|$))+/, gt = /^((?: {4}| {0,3}\t)[^\n]+(?:\n(?:[ \t]*(?:\n|$))*)?)+/, _t = /^ {0,3}(`{3,}(?=[^`\n]*(?:\n|$))|~{3,})([^\n]*)(?:\n|$)(?:|([\s\S]*?)(?:\n|$))(?: {0,3}\1[~`]* *(?=\n|$)|$)/, vt = /^ {0,3}((?:-[\t ]*){3,}|(?:_[ \t]*){3,}|(?:\*[ \t]*){3,})(?:\n+|$)/, yt = /^ {0,3}(#{1,6})(?=\s|$)(.*)(?:\n+|$)/, bt = / {0,3}(?:[*+-]|\d{1,9}[.)])/, xt = /^(?!bull |blockCode|fences|blockquote|heading|html|table)((?:.|\n(?!\s*?\n|bull |blockCode|fences|blockquote|heading|html|table))+?)\n {0,3}(=+|-+) *(?:\n+|$)/, St = J(xt).replace(/bull/g, bt).replace(/blockCode/g, /(?: {4}| {0,3}\t)/).replace(/fences/g, / {0,3}(?:`{3,}|~{3,})/).replace(/blockquote/g, / {0,3}>/).replace(/heading/g, / {0,3}#{1,6}(?:\s|$)/).replace(/html/g, / {0,3}<[^\n>]+>\n/).replace(/\|table/g, "").getRegex(), Ct = J(xt).replace(/bull/g, bt).replace(/blockCode/g, /(?: {4}| {0,3}\t)/).replace(/fences/g, / {0,3}(?:`{3,}|~{3,})/).replace(/blockquote/g, / {0,3}>/).replace(/heading/g, / {0,3}#{1,6}(?:\s|$)/).replace(/html/g, / {0,3}<[^\n>]+>\n/).replace(/table/g, / {0,3}\|?(?:[:\- ]*\|)+[\:\- ]*\n/).getRegex(), wt = /^([^\n]+(?:\n(?!hr|heading|lheading|blockquote|fences|list|html|table|[ \t]+\n)[^\n]+)*)/, Tt = /^[^\n]+/, X = /(?!\s*\])(?:\\[\s\S]|[^\[\]\\])+/, Et = J(/^ {0,3}\[(label)\]: *(?:\n[ \t]*)?([^<\s][^\s]*|<.*?>)(?:(?: +(?:\n[ \t]*)?| *\n[ \t]*)(title))? *(?:\n+|$)/).replace("label", X).replace("title", /(?:"(?:\\"?|[^"\\])*"|'[^'\n]*(?:\n[^'\n]+)*\n?'|\([^()]*\))/).getRegex(), Dt = J(/^(bull)([ \t][^\n]*?)?(?:\n|$)/).replace(/bull/g, bt).getRegex(), Ot = "address|article|aside|base|basefont|blockquote|body|caption|center|col|colgroup|dd|details|dialog|dir|div|dl|dt|fieldset|figcaption|figure|footer|form|frame|frameset|h[1-6]|head|header|hr|html|iframe|legend|li|link|main|menu|menuitem|meta|nav|noframes|ol|optgroup|option|p|param|search|section|summary|table|tbody|td|tfoot|th|thead|title|tr|track|ul", kt = /<!--(?:-?>|[\s\S]*?(?:-->|$))/, At = J("^ {0,3}(?:<(script|pre|style|textarea)[\\s>][\\s\\S]*?(?:</\\1>[^\\n]*\\n*|$)|comment[^\\n]*(\\n+|$)|<\\?[\\s\\S]*?(?:\\?>[^\\n]*\\n*|$)|<![A-Z][\\s\\S]*?(?:>[^\\n]*\\n*|$)|<!\\[CDATA\\[[\\s\\S]*?(?:\\]\\]>[^\\n]*\\n*|$)|</?(tag)(?: +|\\n|/?>)[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$)|<(?!script|pre|style|textarea)([a-z][\\w-]*)(?:attribute)*? */?>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$)|</(?!script|pre|style|textarea)[a-z][\\w-]*\\s*>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$))", "i").replace("comment", kt).replace("tag", Ot).replace("attribute", / +[a-zA-Z:_][\w.:-]*(?: *= *"[^"\n]*"| *= *'[^'\n]*'| *= *[^\s"'=<>`]+)?/).getRegex(), jt = (e) => J(wt).replace("hr", vt).replace("heading", " {0,3}#{1,6}(?:\\s|$)").replace("|lheading", "").replace("|table", "").replace("blockquote", " {0,3}>").replace("fences", " {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~~~)[^\\n]*\\n").replace("list", e).replace("html", "</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag", Ot).getRegex(), Mt = jt(/ {0,3}(?:[*+-]|1[.)])[ \t]+[^ \t\n]/), Nt = jt(/ {0,3}(?:[*+-]|\d{1,9}[.)])(?:[ \t]|\n|$)/), Pt = {
	blockquote: J(/^( {0,3}> ?(paragraph|[^\n]*)(?:\n|$))+/).replace("paragraph", Nt).getRegex(),
	code: gt,
	def: Et,
	fences: _t,
	heading: yt,
	hr: vt,
	html: At,
	lheading: St,
	list: Dt,
	newline: ht,
	paragraph: Mt,
	table: K,
	text: Tt
}, Ft = J("^ *([^\\n ].*)\\n {0,3}((?:\\| *)?:?-+:? *(?:\\| *:?-+:? *)*(?:\\| *)?)(?:\\n((?:(?! *\\n|hr|heading|blockquote|code|fences|list|html).*(?:\\n|$))*)\\n*|$)").replace("hr", vt).replace("heading", " {0,3}#{1,6}(?:\\s|$)").replace("blockquote", " {0,3}>").replace("code", "(?: {4}| {0,3}	)[^\\n]").replace("fences", " {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~~~)[^\\n]*\\n").replace("list", " {0,3}(?:[*+-]|1[.)])[ \\t]").replace("html", "</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag", Ot).getRegex(), It = {
	...Pt,
	lheading: Ct,
	table: Ft,
	paragraph: J(wt).replace("hr", vt).replace("heading", " {0,3}#{1,6}(?:\\s|$)").replace("|lheading", "").replace("table", Ft).replace("blockquote", " {0,3}>").replace("fences", " {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~~~)[^\\n]*\\n").replace("list", " {0,3}(?:[*+-]|1[.)])[ \\t]+[^ \\t\\n]").replace("html", "</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag", Ot).getRegex()
}, Lt = {
	...Pt,
	html: J("^ *(?:comment *(?:\\n|\\s*$)|<(tag)[\\s\\S]+?</\\1> *(?:\\n{2,}|\\s*$)|<tag(?:\"[^\"]*\"|'[^']*'|\\s[^'\"/>\\s]*)*?/?> *(?:\\n{2,}|\\s*$))").replace("comment", kt).replace(/tag/g, "(?!(?:a|em|strong|small|s|cite|q|dfn|abbr|data|time|code|var|samp|kbd|sub|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo|span|br|wbr|ins|del|img)\\b)\\w+(?!:|[^\\w\\s@]*@)\\b").getRegex(),
	def: /^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +(["(][^\n]+[")]))? *(?:\n+|$)/,
	heading: /^(#{1,6})(.*)(?:\n+|$)/,
	fences: K,
	lheading: /^(.+?)\n {0,3}(=+|-+) *(?:\n+|$)/,
	paragraph: J(wt).replace("hr", vt).replace("heading", " *#{1,6} *[^\n]").replace("lheading", St).replace("|table", "").replace("blockquote", " {0,3}>").replace("|fences", "").replace("|list", "").replace("|html", "").replace("|tag", "").getRegex()
}, Rt = /^\\([!"#$%&'()*+,\-./:;<=>?@\[\]\\^_`{|}~])/, zt = /^(`+)([^`]|[^`][\s\S]*?[^`])\1(?!`)/, Bt = /^( {2,}|\\)\n(?!\s*$)/, Vt = /^(`+|[^`])(?:(?= {2,}\n)|[\s\S]*?(?:(?=[\\<!\[`*_]|\b_|$)|[^ ](?= {2,}\n)))/, Ht = /[\p{P}\p{S}]/u, Ut = /[\s\p{P}\p{S}]/u, Wt = /[^\s\p{P}\p{S}]/u, Z = J(/^((?![*_])punctSpace)/, "u").replace(/punctSpace/g, Ut).getRegex(), Gt = /[\p{Pi}\p{Ps}"']/u, Kt = /(?!~)[\p{P}\p{S}]/u, qt = /(?!~)[\s\p{P}\p{S}]/u, Jt = /(?:[^\s\p{P}\p{S}]|~)/u, Yt = J(/link|precode-code|html/, "g").replace("link", /\[(?:[^\[\]`]|(?<a>`+)[^`]+\k<a>(?!`))*?\]\((?:\\[\s\S]|[^\\\(\)]|\((?:\\[\s\S]|[^\\\(\)])*\))*\)/).replace("precode-", mt ? "(?<!`)()" : "(^^|[^`])").replace("code", /(?<b>`+)[^`]+\k<b>(?!`)/).replace("html", /<(?! )[^<>]*?>/).getRegex(), Xt = /^(?:\*+(?:((?!\*)punct)|([^\s*]))?)|^_+(?:((?!_)punct)|([^\s_]))?/, Zt = J(Xt, "u").replace(/punct/g, Ht).getRegex(), Qt = J(Xt, "u").replace(/punct/g, Kt).getRegex(), $t = J(/^(?:\*+(?:((?!\*)(?!openQuote)punct)|([^\s*]))?)|^_+(?:((?!_)(?!openQuote)punct)|([^\s_]))?/, "u").replace(/openQuote/g, Gt).replace(/punct/g, Ht).getRegex(), en = "^[^_*]*?__[^_*]*?\\*[^_*]*?(?=__)|[^*]+(?=[^*])|(?!\\*)punct(\\*+)(?=[\\s]|$)|notPunctSpace(\\*+)(?!\\*)(?=punctSpace|$)|(?!\\*)punctSpace(\\*+)(?=notPunctSpace)|[\\s](\\*+)(?!\\*)(?=punct)|(?!\\*)punct(\\*+)(?!\\*)(?=punct)|notPunctSpace(\\*+)(?=notPunctSpace)", tn = J(en, "gu").replace(/notPunctSpace/g, Wt).replace(/punctSpace/g, Ut).replace(/punct/g, Ht).getRegex(), nn = J(en, "gu").replace(/notPunctSpace/g, Jt).replace(/punctSpace/g, qt).replace(/punct/g, Kt).getRegex(), rn = J("^[^_*]*?__[^_*]*?\\*[^_*]*?(?=__)|[^*]+(?=[^*])|(?!\\*)punct(\\*+)(?=[\\s]|$)|notPunctSpace(\\*+)(?!\\*)(?=punctSpace|$)|(?!\\*)[\\s](\\*+)(?=notPunctSpace)|[\\s](\\*+)(?!\\*)(?=punct)|(?!\\*)punct(\\*+)(?!\\*)(?=punct)|(?:(?!\\*)punct|notPunctSpace)(\\*+)(?!\\*)(?=notPunctSpace)", "gu").replace(/notPunctSpace/g, Wt).replace(/punctSpace/g, Ut).replace(/punct/g, Ht).getRegex(), an = J("^[^_*]*?\\*\\*[^_*]*?_[^_*]*?(?=\\*\\*)|[^_]+(?=[^_])|(?!_)punct(_+)(?=[\\s]|$)|notPunctSpace(_+)(?!_)(?=punctSpace|$)|(?!_)punctSpace(_+)(?=notPunctSpace)|[\\s](_+)(?!_)(?=punct)|(?!_)punct(_+)(?!_)(?=punct)", "gu").replace(/notPunctSpace/g, Wt).replace(/punctSpace/g, Ut).replace(/punct/g, Ht).getRegex(), on = J("^[^_*]*?\\*\\*[^_*]*?_[^_*]*?(?=\\*\\*)|[^_]+(?=[^_])|(?!_)punct(_+)(?=[\\s]|$)|notPunctSpace(_+)(?!_)(?=punctSpace|$)|(?!_)[\\s](_+)(?=notPunctSpace)|[\\s](_+)(?!_)(?=punct)|(?!_)punct(_+)(?!_)(?=punct)|(?:(?!_)punct|notPunctSpace)(_+)(?!_)(?=notPunctSpace)", "gu").replace(/notPunctSpace/g, Wt).replace(/punctSpace/g, Ut).replace(/punct/g, Ht).getRegex(), sn = J(/^~~?(?:((?!~)punct)|[^\s~])/, "u").replace(/punct/g, Ht).getRegex(), cn = J("^[^~]+(?=[^~])|(?!~)punct(~~?)(?=[\\s]|$)|notPunctSpace(~~?)(?!~)(?=punctSpace|$)|(?!~)punctSpace(~~?)(?=notPunctSpace)|[\\s](~~?)(?!~)(?=punct)|(?!~)punct(~~?)(?!~)(?=punct)|notPunctSpace(~~?)(?=notPunctSpace)", "gu").replace(/notPunctSpace/g, Wt).replace(/punctSpace/g, Ut).replace(/punct/g, Ht).getRegex(), ln = J(/\\(punct)/, "gu").replace(/punct/g, Ht).getRegex(), un = J(/^<(scheme:[^\s\x00-\x1f<>]*|email)>/).replace("scheme", /[a-zA-Z][a-zA-Z0-9+.-]{1,31}/).replace("email", /[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+(@)[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+(?![-_])/).getRegex(), dn = J(kt).replace("(?:-->|$)", "-->").getRegex(), fn = J("^comment|^</[a-zA-Z][\\w:-]*\\s*>|^<[a-zA-Z][\\w-]*(?:attribute)*?\\s*/?>|^<\\?[\\s\\S]*?\\?>|^<![a-zA-Z]+\\s[\\s\\S]*?>|^<!\\[CDATA\\[[\\s\\S]*?\\]\\]>").replace("comment", dn).replace("attribute", /\s+[a-zA-Z:_][\w.:-]*(?:\s*=\s*"[^"]*"|\s*=\s*'[^']*'|\s*=\s*[^\s"'=<>`]+)?/).getRegex(), pn = /(?:\[(?:\\[\s\S]|[^\[\]\\])*\]|\\[\s\S]|`+(?!`)[^`]*?`+(?!`)|``+(?=\])|[^\[\]\\`])*?/, mn = J(/^!?\[(label)\]\(\s*(href)(?:(?:[ \t]+(?:\n[ \t]*)?|\n[ \t]*)(title))?\s*\)/).replace("label", pn).replace("href", /<(?:\\.|[^\n<>\\])+>|[^ \t\n\x00-\x1f]+|(?=\))/).replace("title", /"(?:\\"?|[^"\\])*"|'(?:\\'?|[^'\\])*'|\((?:\\\)?|[^)\\])*\)/).getRegex(), hn = J(/^!?\[(label)\]\[(ref)\]/).replace("label", pn).replace("ref", X).getRegex(), gn = J(/^!?\[(ref)\](?:\[\])?/).replace("ref", X).getRegex(), _n = J("reflink|nolink(?!\\()", "g").replace("reflink", hn).replace("nolink", gn).getRegex(), vn = /[hH][tT][tT][pP][sS]?|[fF][tT][pP]/, yn = {
	_backpedal: K,
	anyPunctuation: ln,
	autolink: un,
	blockSkip: Yt,
	br: Bt,
	code: zt,
	del: K,
	delLDelim: K,
	delRDelim: K,
	emStrongLDelim: Zt,
	emStrongRDelimAst: tn,
	emStrongRDelimUnd: an,
	escape: Rt,
	link: mn,
	nolink: gn,
	punctuation: Z,
	reflink: hn,
	reflinkSearch: _n,
	tag: fn,
	text: Vt,
	url: K
}, bn = {
	...yn,
	emStrongLDelim: $t,
	emStrongRDelimAst: rn,
	emStrongRDelimUnd: on,
	link: J(/^!?\[(label)\]\((.*?)\)/).replace("label", pn).getRegex(),
	reflink: J(/^!?\[(label)\]\s*\[([^\]]*)\]/).replace("label", pn).getRegex()
}, xn = {
	...yn,
	emStrongRDelimAst: nn,
	emStrongLDelim: Qt,
	delLDelim: sn,
	delRDelim: cn,
	url: J(/^((?:protocol):\/\/|www\.)(?:[a-zA-Z0-9\-]+\.?)+[^\s<]*|^email/).replace("protocol", vn).replace("email", /[A-Za-z0-9._+-]+(@)[a-zA-Z0-9-_]+(?:\.[a-zA-Z0-9-_]*[a-zA-Z0-9])+(?![-_])/).getRegex(),
	_backpedal: /(?:[^?!.,:;*_'"~()&]+|\([^)]*\)|&(?![a-zA-Z0-9]+;$)|[?!.,:;*_'"~)]+(?!$))+/,
	del: /^(~~?)(?=[^\s~])((?:\\[\s\S]|[^\\])*?(?:\\[\s\S]|[^\s~\\]))\1(?=[^~]|$)/,
	text: J(/^(`+|~+|[^`~])(?:(?=[`~])|(?= {2,}\n)|(?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)|[\s\S]*?(?:(?=[\\<!\[`*~_]|\b_|protocol:\/\/|www\.|$)|[^ ](?= {2,}\n)|[^a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-](?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)))/).replace("protocol", vn).getRegex()
}, Sn = {
	...xn,
	br: J(Bt).replace("{2,}", "*").getRegex(),
	text: J(xn.text).replace("\\b_", "\\b_| {2,}\\n").replace(/\{2,\}/g, "*").getRegex()
}, Cn = {
	normal: Pt,
	gfm: It,
	pedantic: Lt
}, wn = {
	normal: yn,
	gfm: xn,
	breaks: Sn,
	pedantic: bn
}, Tn = {
	"&": "&amp;",
	"<": "&lt;",
	">": "&gt;",
	"\"": "&quot;",
	"'": "&#39;"
}, En = (e) => Tn[e];
function Dn(e, t) {
	if (t) {
		if (Y.escapeTest.test(e)) return e.replace(Y.escapeReplace, En);
	} else if (Y.escapeTestNoEncode.test(e)) return e.replace(Y.escapeReplaceNoEncode, En);
	return e;
}
function On(e) {
	try {
		e = encodeURI(e).replace(Y.percentDecode, "%");
	} catch {
		return null;
	}
	return e;
}
function kn(e, t) {
	let n = e.replace(Y.findPipe, (e, t, n) => {
		let r = !1, i = t;
		for (; --i >= 0 && n[i] === "\\";) r = !r;
		return r ? "|" : " |";
	}).split(Y.splitPipe), r = 0;
	if (n[0].trim() || n.shift(), n.length > 0 && !n.at(-1)?.trim() && n.pop(), t) if (n.length > t) n.splice(t);
	else for (; n.length < t;) n.push("");
	for (; r < n.length; r++) n[r] = n[r].trim().replace(Y.slashPipe, "|");
	return n;
}
function An(e, t, n) {
	let r = e.length;
	if (r === 0) return "";
	let i = 0;
	for (; i < r;) {
		let a = e.charAt(r - i - 1);
		if (a === t && !n) i++;
		else if (a !== t && n) i++;
		else break;
	}
	return e.slice(0, r - i);
}
function jn(e) {
	let t = e.split("\n"), n = t.length - 1;
	for (; n >= 0 && Y.blankLine.test(t[n]);) n--;
	return t.length - n <= 2 ? e : t.slice(0, n + 1).join("\n");
}
function Mn(e, t) {
	if (e.indexOf(t[1]) === -1) return -1;
	let n = 0;
	for (let r = 0; r < e.length; r++) if (e[r] === "\\") r++;
	else if (e[r] === t[0]) n++;
	else if (e[r] === t[1] && (n--, n < 0)) return r;
	return n > 0 ? -2 : -1;
}
function Nn(e, t = 0) {
	let n = t, r = "";
	for (let t of e) if (t === "	") {
		let e = 4 - n % 4;
		r += " ".repeat(e), n += e;
	} else r += t, n++;
	return r;
}
function Pn(e, t, n, r, i) {
	let a = t.href, o = t.title || null, s = e[1].replace(i.other.outputLinkReplace, "$1");
	r.state.inLink = !0;
	let c = {
		type: e[0].charAt(0) === "!" ? "image" : "link",
		raw: n,
		href: a,
		title: o,
		text: s,
		tokens: r.inlineTokens(s)
	};
	return r.state.inLink = !1, c;
}
function Fn(e, t, n) {
	let r = e.match(n.other.indentCodeCompensation);
	if (r === null) return t;
	let i = r[1];
	return t.split("\n").map((e) => {
		let t = e.match(n.other.beginningSpace);
		if (t === null) return e;
		let [r] = t;
		return r.length >= i.length ? e.slice(i.length) : e;
	}).join("\n");
}
var In = class {
	options;
	rules;
	lexer;
	constructor(e) {
		this.options = e || ft;
	}
	space(e) {
		let t = this.rules.block.newline.exec(e);
		if (t && t[0].length > 0) return {
			type: "space",
			raw: t[0]
		};
	}
	code(e) {
		let t = this.rules.block.code.exec(e);
		if (t) {
			let e = this.options.pedantic ? t[0] : jn(t[0]);
			return {
				type: "code",
				raw: e,
				codeBlockStyle: "indented",
				text: e.replace(this.rules.other.codeRemoveIndent, "")
			};
		}
	}
	fences(e) {
		let t = this.rules.block.fences.exec(e);
		if (t) {
			let e = t[0], n = Fn(e, t[3] || "", this.rules);
			return {
				type: "code",
				raw: e,
				lang: t[2] ? t[2].trim().replace(this.rules.inline.anyPunctuation, "$1") : t[2],
				text: n
			};
		}
	}
	heading(e) {
		let t = this.rules.block.heading.exec(e);
		if (t) {
			let e = t[2].trim();
			if (this.rules.other.endingHash.test(e)) {
				let t = An(e, "#");
				(this.options.pedantic || !t || this.rules.other.endingSpaceChar.test(t)) && (e = t.trim());
			}
			return {
				type: "heading",
				raw: An(t[0], "\n"),
				depth: t[1].length,
				text: e,
				tokens: this.lexer.inline(e)
			};
		}
	}
	hr(e) {
		let t = this.rules.block.hr.exec(e);
		if (t) return {
			type: "hr",
			raw: An(t[0], "\n")
		};
	}
	blockquote(e) {
		let t = this.rules.block.blockquote.exec(e);
		if (t) {
			let e = An(t[0], "\n").split("\n"), n = "", r = "", i = [];
			for (; e.length > 0;) {
				let t = !1, a = [], o;
				for (o = 0; o < e.length; o++) if (this.rules.other.blockquoteStart.test(e[o])) a.push(e[o]), t = !0;
				else if (!t) a.push(e[o]);
				else break;
				e = e.slice(o);
				let s = a.join("\n"), c = s.replace(this.rules.other.blockquoteSetextReplace, "\n    $1").replace(this.rules.other.blockquoteSetextReplace2, "");
				n = n ? `${n}
${s}` : s, r = r ? `${r}
${c}` : c;
				let l = this.lexer.state.top;
				if (this.lexer.state.top = !0, this.lexer.blockTokens(c, i, !0), this.lexer.state.top = l, e.length === 0) break;
				let u = i.at(-1);
				if (u?.type === "code") break;
				if (u?.type === "blockquote") {
					let t = u, a = e.join("\n"), o = t.raw + "\n" + a.replace(this.rules.other.blockquoteSetextReplace2, ""), s = this.blockquote(o);
					i[i.length - 1] = s, n = `${n}
${a}`, r = r.substring(0, r.length - t.text.length) + s.text;
					break;
				}
				if (u?.type === "list") {
					let t = u, a = t.raw + "\n" + e.join("\n"), o = this.list(a);
					i[i.length - 1] = o, n = n.substring(0, n.length - u.raw.length) + o.raw, r = r.substring(0, r.length - t.raw.length) + o.raw, e = a.substring(i.at(-1).raw.length).split("\n");
					continue;
				}
			}
			return {
				type: "blockquote",
				raw: n,
				tokens: i,
				text: r
			};
		}
	}
	list(e) {
		let t = this.rules.block.list.exec(e);
		if (t) {
			let n = t[1].trim(), r = n.length > 1, i = {
				type: "list",
				raw: "",
				ordered: r,
				start: r ? +n.slice(0, -1) : "",
				loose: !1,
				items: []
			};
			n = r ? `\\d{1,9}\\${n.slice(-1)}` : `\\${n}`, this.options.pedantic && (n = r ? n : "[*+-]");
			let a = this.rules.other.listItemRegex(n), o = !1;
			for (; e;) {
				let n = !1, r = "", s = "";
				if (!(t = a.exec(e)) || this.rules.block.hr.test(e)) break;
				r = t[0], e = e.substring(r.length);
				let c = Nn(t[2].split("\n", 1)[0], t[1].length), l = e.split("\n", 1)[0], u = !c.trim(), d = 0;
				if (this.options.pedantic ? (d = 2, s = c.trimStart()) : u ? d = t[1].length + 1 : (d = c.search(this.rules.other.nonSpaceChar), d = d > 4 ? 1 : d, s = c.slice(d), d += t[1].length), u && this.rules.other.blankLine.test(l) && (r += l + "\n", e = e.substring(l.length + 1), n = !0), !n) {
					let t = this.rules.other.nextBulletRegex(d), n = this.rules.other.hrRegex(d), i = this.rules.other.fencesBeginRegex(d), a = this.rules.other.headingBeginRegex(d), o = this.rules.other.htmlBeginRegex(d), f = this.rules.other.blockquoteBeginRegex(d);
					for (; e;) {
						let p = e.split("\n", 1)[0], m;
						if (l = p, this.options.pedantic ? (l = l.replace(this.rules.other.listReplaceNesting, "  "), m = l) : m = l.replace(this.rules.other.tabCharGlobal, "    "), i.test(l) || a.test(l) || o.test(l) || f.test(l) || t.test(l) || n.test(l)) break;
						if (m.search(this.rules.other.nonSpaceChar) >= d || !l.trim()) s += "\n" + m.slice(d);
						else {
							if (u || c.replace(this.rules.other.tabCharGlobal, "    ").search(this.rules.other.nonSpaceChar) >= 4 || i.test(c) || a.test(c) || n.test(c)) break;
							s += "\n" + l;
						}
						u = !l.trim(), r += p + "\n", e = e.substring(p.length + 1), c = m.slice(d);
					}
				}
				i.loose || (o ? i.loose = !0 : this.rules.other.doubleBlankLine.test(r) && (o = !0)), i.items.push({
					type: "list_item",
					raw: r,
					task: !!this.options.gfm && this.rules.other.listIsTask.test(s),
					loose: !1,
					text: s,
					tokens: []
				}), i.raw += r;
			}
			let s = i.items.at(-1);
			if (s) s.raw = s.raw.trimEnd(), s.text = s.text.trimEnd();
			else return;
			i.raw = i.raw.trimEnd();
			for (let e of i.items) {
				this.lexer.state.top = !1, e.tokens = this.lexer.blockTokens(e.text, []);
				let t = e.tokens[0];
				if (e.task && (t?.type === "text" || t?.type === "paragraph")) {
					e.text = e.text.replace(this.rules.other.listReplaceTask, ""), t.raw = t.raw.replace(this.rules.other.listReplaceTask, ""), t.text = t.text.replace(this.rules.other.listReplaceTask, "");
					for (let e = this.lexer.inlineQueue.length - 1; e >= 0; e--) if (this.rules.other.listIsTask.test(this.lexer.inlineQueue[e].src)) {
						this.lexer.inlineQueue[e].src = this.lexer.inlineQueue[e].src.replace(this.rules.other.listReplaceTask, "");
						break;
					}
					let n = this.rules.other.listTaskCheckbox.exec(e.raw);
					if (n) {
						let t = {
							type: "checkbox",
							raw: n[0] + " ",
							checked: n[0] !== "[ ]"
						};
						e.checked = t.checked, i.loose ? e.tokens[0] && ["paragraph", "text"].includes(e.tokens[0].type) && "tokens" in e.tokens[0] && e.tokens[0].tokens ? (e.tokens[0].raw = t.raw + e.tokens[0].raw, e.tokens[0].text = t.raw + e.tokens[0].text, e.tokens[0].tokens.unshift(t)) : e.tokens.unshift({
							type: "paragraph",
							raw: t.raw,
							text: t.raw,
							tokens: [t]
						}) : e.tokens.unshift(t);
					}
				} else e.task &&= !1;
				if (!i.loose) {
					let t = e.tokens.filter((e) => e.type === "space");
					i.loose = t.length > 0 && t.some((e) => this.rules.other.anyLine.test(e.raw));
				}
			}
			if (i.loose) for (let e of i.items) {
				e.loose = !0;
				for (let t of e.tokens) t.type === "text" && (t.type = "paragraph");
			}
			return i;
		}
	}
	html(e) {
		let t = this.rules.block.html.exec(e);
		if (t) {
			let e = jn(t[0]);
			return {
				type: "html",
				block: !0,
				raw: e,
				pre: t[1] === "pre" || t[1] === "script" || t[1] === "style",
				text: e
			};
		}
	}
	def(e) {
		let t = this.rules.block.def.exec(e);
		if (t) {
			let e = t[1].toLowerCase().replace(this.rules.other.multipleSpaceGlobal, " "), n = t[2] ? t[2].replace(this.rules.other.hrefBrackets, "$1").replace(this.rules.inline.anyPunctuation, "$1") : "", r = t[3] ? t[3].substring(1, t[3].length - 1).replace(this.rules.inline.anyPunctuation, "$1") : t[3];
			return {
				type: "def",
				tag: e,
				raw: An(t[0], "\n"),
				href: n,
				title: r
			};
		}
	}
	table(e) {
		let t = this.rules.block.table.exec(e);
		if (!t || !this.rules.other.tableDelimiter.test(t[2])) return;
		let n = kn(t[1]), r = t[2].replace(this.rules.other.tableAlignChars, "").split("|"), i = t[3]?.trim() ? t[3].replace(this.rules.other.tableRowBlankLine, "").split("\n") : [], a = {
			type: "table",
			raw: An(t[0], "\n"),
			header: [],
			align: [],
			rows: []
		};
		if (n.length === r.length) {
			for (let e of r) this.rules.other.tableAlignRight.test(e) ? a.align.push("right") : this.rules.other.tableAlignCenter.test(e) ? a.align.push("center") : this.rules.other.tableAlignLeft.test(e) ? a.align.push("left") : a.align.push(null);
			for (let e = 0; e < n.length; e++) a.header.push({
				text: n[e],
				tokens: this.lexer.inline(n[e]),
				header: !0,
				align: a.align[e]
			});
			for (let e of i) a.rows.push(kn(e, a.header.length).map((e, t) => ({
				text: e,
				tokens: this.lexer.inline(e),
				header: !1,
				align: a.align[t]
			})));
			return a;
		}
	}
	lheading(e) {
		let t = this.rules.block.lheading.exec(e);
		if (t) {
			let e = t[1].trim();
			return {
				type: "heading",
				raw: An(t[0], "\n"),
				depth: t[2].charAt(0) === "=" ? 1 : 2,
				text: e,
				tokens: this.lexer.inline(e)
			};
		}
	}
	paragraph(e) {
		let t = this.rules.block.paragraph.exec(e);
		if (t) {
			let e = t[1].charAt(t[1].length - 1) === "\n" ? t[1].slice(0, -1) : t[1];
			return {
				type: "paragraph",
				raw: t[0],
				text: e,
				tokens: this.lexer.inline(e)
			};
		}
	}
	text(e) {
		let t = this.rules.block.text.exec(e);
		if (t) return {
			type: "text",
			raw: t[0],
			text: t[0],
			tokens: this.lexer.inline(t[0])
		};
	}
	escape(e) {
		let t = this.rules.inline.escape.exec(e);
		if (t) return {
			type: "escape",
			raw: t[0],
			text: t[1]
		};
	}
	tag(e) {
		let t = this.rules.inline.tag.exec(e);
		if (t) return !this.lexer.state.inLink && this.rules.other.startATag.test(t[0]) ? this.lexer.state.inLink = !0 : this.lexer.state.inLink && this.rules.other.endATag.test(t[0]) && (this.lexer.state.inLink = !1), !this.lexer.state.inRawBlock && this.rules.other.startPreScriptTag.test(t[0]) ? this.lexer.state.inRawBlock = !0 : this.lexer.state.inRawBlock && this.rules.other.endPreScriptTag.test(t[0]) && (this.lexer.state.inRawBlock = !1), {
			type: "html",
			raw: t[0],
			inLink: this.lexer.state.inLink,
			inRawBlock: this.lexer.state.inRawBlock,
			block: !1,
			text: t[0]
		};
	}
	link(e) {
		let t = this.rules.inline.link.exec(e);
		if (t) {
			let e = t[2].trim();
			if (!this.options.pedantic && this.rules.other.startAngleBracket.test(e)) {
				if (!this.rules.other.endAngleBracket.test(e)) return;
				let t = An(e.slice(0, -1), "\\");
				if ((e.length - t.length) % 2 == 0) return;
			} else {
				let e = Mn(t[2], "()");
				if (e === -2) return;
				if (e > -1) {
					let n = (t[0].indexOf("!") === 0 ? 5 : 4) + t[1].length + e;
					t[2] = t[2].substring(0, e), t[0] = t[0].substring(0, n).trim(), t[3] = "";
				}
			}
			let n = t[2], r = "";
			if (this.options.pedantic) {
				let e = this.rules.other.pedanticHrefTitle.exec(n);
				e && (n = e[1], r = e[3]);
			} else r = t[3] ? t[3].slice(1, -1) : "";
			return n = n.trim(), this.rules.other.startAngleBracket.test(n) && (n = this.options.pedantic && !this.rules.other.endAngleBracket.test(e) ? n.slice(1) : n.slice(1, -1)), Pn(t, {
				href: n && n.replace(this.rules.inline.anyPunctuation, "$1"),
				title: r && r.replace(this.rules.inline.anyPunctuation, "$1")
			}, t[0], this.lexer, this.rules);
		}
	}
	reflink(e, t) {
		let n;
		if ((n = this.rules.inline.reflink.exec(e)) || (n = this.rules.inline.nolink.exec(e))) {
			let e = t[(n[2] || n[1]).replace(this.rules.other.multipleSpaceGlobal, " ").toLowerCase()];
			if (!e) {
				let e = n[0].charAt(0);
				return {
					type: "text",
					raw: e,
					text: e
				};
			}
			return Pn(n, e, n[0], this.lexer, this.rules);
		}
	}
	emStrong(e, t, n = "") {
		let r = this.rules.inline.emStrongLDelim.exec(e);
		if (!(!r || !r[1] && !r[2] && !r[3] && !r[4] || r[4] && n.match(this.rules.other.unicodeAlphaNumeric)) && (!(r[1] || r[3]) || !n || this.rules.inline.punctuation.exec(n))) {
			let i = [...r[0]].length - 1, a, o, s = i, c = 0, l = r[0][0], u = n === l, d = l === "*" ? this.rules.inline.emStrongRDelimAst : this.rules.inline.emStrongRDelimUnd;
			for (d.lastIndex = 0, t = t.slice(-1 * e.length + i); (r = d.exec(t)) !== null;) {
				if (a = r[1] || r[2] || r[3] || r[4] || r[5] || r[6], !a) continue;
				if (o = [...a].length, r[3] || r[4]) {
					s += o;
					continue;
				}
				if (r[5] || r[6]) {
					if (i % 3 && !((i + o) % 3)) {
						c += o;
						continue;
					}
					if (u) break;
				}
				if (s -= o, s > 0) continue;
				o = Math.min(o, o + s + c);
				let t = [...r[0]][0].length, n = e.slice(0, i + r.index + t + o);
				if (Math.min(i, o) % 2) {
					let e = n.slice(1, -1);
					return {
						type: "em",
						raw: n,
						text: e,
						tokens: this.lexer.inlineTokens(e)
					};
				}
				let l = n.slice(2, -2);
				return {
					type: "strong",
					raw: n,
					text: l,
					tokens: this.lexer.inlineTokens(l)
				};
			}
		}
	}
	codespan(e) {
		let t = this.rules.inline.code.exec(e);
		if (t) {
			let e = t[2].replace(this.rules.other.newLineCharGlobal, " "), n = this.rules.other.nonSpaceChar.test(e), r = this.rules.other.startingSpaceChar.test(e) && this.rules.other.endingSpaceChar.test(e);
			return n && r && (e = e.substring(1, e.length - 1)), {
				type: "codespan",
				raw: t[0],
				text: e
			};
		}
	}
	br(e) {
		let t = this.rules.inline.br.exec(e);
		if (t) return {
			type: "br",
			raw: t[0]
		};
	}
	del(e, t, n = "") {
		let r = this.rules.inline.delLDelim.exec(e);
		if (r && (!r[1] || !n || this.rules.inline.punctuation.exec(n))) {
			let n = [...r[0]].length - 1, i, a, o = n, s = this.rules.inline.delRDelim;
			for (s.lastIndex = 0, t = t.slice(-1 * e.length + n); (r = s.exec(t)) !== null;) {
				if (i = r[1] || r[2] || r[3] || r[4] || r[5] || r[6], !i || (a = [...i].length, a !== n)) continue;
				if (r[3] || r[4]) {
					o += a;
					continue;
				}
				if (o -= a, o > 0) continue;
				a = Math.min(a, a + o);
				let t = [...r[0]][0].length, s = e.slice(0, n + r.index + t + a), c = s.slice(n, -n);
				return {
					type: "del",
					raw: s,
					text: c,
					tokens: this.lexer.inlineTokens(c)
				};
			}
		}
	}
	autolink(e) {
		let t = this.rules.inline.autolink.exec(e);
		if (t) {
			let e, n;
			return t[2] === "@" ? (e = t[1], n = "mailto:" + e) : (e = t[1], n = e), {
				type: "link",
				raw: t[0],
				text: e,
				href: n,
				tokens: [{
					type: "text",
					raw: e,
					text: e
				}]
			};
		}
	}
	url(e) {
		let t;
		if (t = this.rules.inline.url.exec(e)) {
			let e, n;
			if (t[2] === "@") e = t[0], n = "mailto:" + e;
			else {
				let r;
				do
					r = t[0], t[0] = this.rules.inline._backpedal.exec(t[0])?.[0] ?? "";
				while (r !== t[0]);
				e = t[0], n = t[1] === "www." ? "http://" + t[0] : t[0];
			}
			return {
				type: "link",
				raw: t[0],
				text: e,
				href: n,
				tokens: [{
					type: "text",
					raw: e,
					text: e
				}]
			};
		}
	}
	inlineText(e) {
		let t = this.rules.inline.text.exec(e);
		if (t) {
			let e = this.lexer.state.inRawBlock;
			return {
				type: "text",
				raw: t[0],
				text: t[0],
				escaped: e
			};
		}
	}
}, Ln = class e {
	tokens;
	options;
	state;
	inlineQueue;
	tokenizer;
	constructor(e) {
		this.tokens = [], this.tokens.links = Object.create(null), this.options = e || ft, this.options.tokenizer = this.options.tokenizer || new In(), this.tokenizer = this.options.tokenizer, this.tokenizer.options = this.options, this.tokenizer.lexer = this, this.inlineQueue = [], this.state = {
			inLink: !1,
			inRawBlock: !1,
			top: !0
		};
		let t = {
			other: Y,
			block: Cn.normal,
			inline: wn.normal
		};
		this.options.pedantic ? (t.block = Cn.pedantic, t.inline = wn.pedantic) : this.options.gfm && (t.block = Cn.gfm, t.inline = this.options.breaks ? wn.breaks : wn.gfm), this.tokenizer.rules = t;
	}
	static get rules() {
		return {
			block: Cn,
			inline: wn
		};
	}
	static lex(t, n) {
		return new e(n).lex(t);
	}
	static lexInline(t, n) {
		return new e(n).inlineTokens(t);
	}
	lex(e) {
		e = e.replace(Y.carriageReturn, "\n"), this.blockTokens(e, this.tokens);
		for (let e = 0; e < this.inlineQueue.length; e++) {
			let t = this.inlineQueue[e];
			this.inlineTokens(t.src, t.tokens);
		}
		return this.inlineQueue = [], this.tokens;
	}
	blockTokens(e, t = [], n = !1) {
		this.tokenizer.lexer = this, this.options.pedantic && (e = e.replace(Y.tabCharGlobal, "    ").replace(Y.spaceLine, ""));
		let r = Infinity;
		for (; e;) {
			if (e.length < r) r = e.length;
			else {
				this.infiniteLoopError(e.charCodeAt(0));
				break;
			}
			let i;
			if (this.options.extensions?.block?.some((n) => (i = n.call({ lexer: this }, e, t)) ? (e = e.substring(i.raw.length), t.push(i), !0) : !1)) continue;
			if (i = this.tokenizer.space(e)) {
				e = e.substring(i.raw.length);
				let n = t.at(-1);
				i.raw.length === 1 && n !== void 0 ? n.raw += "\n" : t.push(i);
				continue;
			}
			if (i = this.tokenizer.code(e)) {
				e = e.substring(i.raw.length);
				let n = t.at(-1);
				n?.type === "paragraph" || n?.type === "text" ? (n.raw += (n.raw.endsWith("\n") ? "" : "\n") + i.raw, n.text += "\n" + i.text, this.inlineQueue.at(-1).src = n.text) : t.push(i);
				continue;
			}
			if (i = this.tokenizer.fences(e)) {
				e = e.substring(i.raw.length), t.push(i);
				continue;
			}
			if (i = this.tokenizer.heading(e)) {
				e = e.substring(i.raw.length), t.push(i);
				continue;
			}
			if (i = this.tokenizer.hr(e)) {
				e = e.substring(i.raw.length), t.push(i);
				continue;
			}
			if (i = this.tokenizer.blockquote(e)) {
				e = e.substring(i.raw.length), t.push(i);
				continue;
			}
			if (i = this.tokenizer.list(e)) {
				e = e.substring(i.raw.length), t.push(i);
				continue;
			}
			if (i = this.tokenizer.html(e)) {
				e = e.substring(i.raw.length), t.push(i);
				continue;
			}
			if (i = this.tokenizer.def(e)) {
				e = e.substring(i.raw.length);
				let n = t.at(-1);
				n?.type === "paragraph" || n?.type === "text" ? (n.raw += (n.raw.endsWith("\n") ? "" : "\n") + i.raw, n.text += "\n" + i.raw, this.inlineQueue.at(-1).src = n.text) : this.tokens.links[i.tag] || (this.tokens.links[i.tag] = {
					href: i.href,
					title: i.title
				}, t.push(i));
				continue;
			}
			if (i = this.tokenizer.table(e)) {
				e = e.substring(i.raw.length), t.push(i);
				continue;
			}
			if (i = this.tokenizer.lheading(e)) {
				e = e.substring(i.raw.length), t.push(i);
				continue;
			}
			let a = e;
			if (this.options.extensions?.startBlock) {
				let t = Infinity, n = e.slice(1), r;
				this.options.extensions.startBlock.forEach((e) => {
					r = e.call({ lexer: this }, n), typeof r == "number" && r >= 0 && (t = Math.min(t, r));
				}), t < Infinity && t >= 0 && (a = e.substring(0, t + 1));
			}
			if (this.state.top && (i = this.tokenizer.paragraph(a))) {
				let r = t.at(-1);
				n && r?.type === "paragraph" ? (r.raw += (r.raw.endsWith("\n") ? "" : "\n") + i.raw, r.text += "\n" + i.text, this.inlineQueue.pop(), this.inlineQueue.at(-1).src = r.text) : t.push(i), n = a.length !== e.length, e = e.substring(i.raw.length);
				continue;
			}
			if (i = this.tokenizer.text(e)) {
				e = e.substring(i.raw.length);
				let n = t.at(-1);
				n?.type === "text" ? (n.raw += (n.raw.endsWith("\n") ? "" : "\n") + i.raw, n.text += "\n" + i.text, this.inlineQueue.pop(), this.inlineQueue.at(-1).src = n.text) : t.push(i);
				continue;
			}
			if (e) {
				this.infiniteLoopError(e.charCodeAt(0));
				break;
			}
		}
		return this.state.top = !0, t;
	}
	inline(e, t = []) {
		return this.inlineQueue.push({
			src: e,
			tokens: t
		}), t;
	}
	inlineTokens(e, t = []) {
		this.tokenizer.lexer = this;
		let n = e;
		if (this.tokens.links) {
			let e = Object.keys(this.tokens.links);
			e.length > 0 && (n = n.replace(this.tokenizer.rules.inline.reflinkSearch, (t) => e.includes(t.slice(t.lastIndexOf("[") + 1, -1)) ? "[" + "a".repeat(t.length - 2) + "]" : t));
		}
		n = n.replace(this.tokenizer.rules.inline.anyPunctuation, "++"), n = n.replace(this.tokenizer.rules.inline.blockSkip, (e, t, n) => {
			let r = n ? n.length : 0;
			return e.slice(0, r) + "[" + "a".repeat(e.length - r - 2) + "]";
		}), n = this.options.hooks?.emStrongMask?.call({ lexer: this }, n) ?? n;
		let r = !1, i = "", a = Infinity;
		for (; e;) {
			if (e.length < a) a = e.length;
			else {
				this.infiniteLoopError(e.charCodeAt(0));
				break;
			}
			r || (i = ""), r = !1;
			let o;
			if (this.options.extensions?.inline?.some((n) => (o = n.call({ lexer: this }, e, t)) ? (e = e.substring(o.raw.length), t.push(o), !0) : !1)) continue;
			if (o = this.tokenizer.escape(e)) {
				e = e.substring(o.raw.length), t.push(o);
				continue;
			}
			if (o = this.tokenizer.tag(e)) {
				e = e.substring(o.raw.length), t.push(o);
				continue;
			}
			if (o = this.tokenizer.link(e)) {
				e = e.substring(o.raw.length), t.push(o);
				continue;
			}
			if (o = this.tokenizer.reflink(e, this.tokens.links)) {
				e = e.substring(o.raw.length);
				let n = t.at(-1);
				o.type === "text" && n?.type === "text" ? (n.raw += o.raw, n.text += o.text) : t.push(o);
				continue;
			}
			if (o = this.tokenizer.emStrong(e, n, i)) {
				e = e.substring(o.raw.length), t.push(o);
				continue;
			}
			if (o = this.tokenizer.codespan(e)) {
				e = e.substring(o.raw.length), t.push(o);
				continue;
			}
			if (o = this.tokenizer.br(e)) {
				e = e.substring(o.raw.length), t.push(o);
				continue;
			}
			if (o = this.tokenizer.del(e, n, i)) {
				e = e.substring(o.raw.length), t.push(o);
				continue;
			}
			if (o = this.tokenizer.autolink(e)) {
				e = e.substring(o.raw.length), t.push(o);
				continue;
			}
			if (!this.state.inLink && (o = this.tokenizer.url(e))) {
				e = e.substring(o.raw.length), t.push(o);
				continue;
			}
			let s = e;
			if (this.options.extensions?.startInline) {
				let t = Infinity, n = e.slice(1), r;
				this.options.extensions.startInline.forEach((e) => {
					r = e.call({ lexer: this }, n), typeof r == "number" && r >= 0 && (t = Math.min(t, r));
				}), t < Infinity && t >= 0 && (s = e.substring(0, t + 1));
			}
			if (o = this.tokenizer.inlineText(s)) {
				e = e.substring(o.raw.length), o.raw.slice(-1) !== "_" && (i = o.raw.slice(-1)), r = !0;
				let n = t.at(-1);
				n?.type === "text" ? (n.raw += o.raw, n.text += o.text) : t.push(o);
				continue;
			}
			if (e) {
				this.infiniteLoopError(e.charCodeAt(0));
				break;
			}
		}
		return t;
	}
	infiniteLoopError(e) {
		let t = "Infinite loop on byte: " + e;
		if (this.options.silent) console.error(t);
		else throw Error(t);
	}
}, Rn = class {
	options;
	parser;
	constructor(e) {
		this.options = e || ft;
	}
	space(e) {
		return "";
	}
	code({ text: e, lang: t, escaped: n }) {
		let r = (t || "").match(Y.notSpaceStart)?.[0], i = e.replace(Y.endingNewline, "") + "\n";
		return r ? "<pre><code class=\"language-" + Dn(r) + "\">" + (n ? i : Dn(i, !0)) + "</code></pre>\n" : "<pre><code>" + (n ? i : Dn(i, !0)) + "</code></pre>\n";
	}
	blockquote({ tokens: e }) {
		return `<blockquote>
${this.parser.parse(e)}</blockquote>
`;
	}
	html({ text: e }) {
		return e;
	}
	def(e) {
		return "";
	}
	heading({ tokens: e, depth: t }) {
		return `<h${t}>${this.parser.parseInline(e)}</h${t}>
`;
	}
	hr(e) {
		return "<hr>\n";
	}
	list(e) {
		let t = e.ordered, n = e.start, r = "";
		for (let t = 0; t < e.items.length; t++) {
			let n = e.items[t];
			r += this.listitem(n);
		}
		let i = t ? "ol" : "ul", a = t && n !== 1 ? " start=\"" + n + "\"" : "";
		return "<" + i + a + ">\n" + r + "</" + i + ">\n";
	}
	listitem(e) {
		return `<li>${this.parser.parse(e.tokens)}</li>
`;
	}
	checkbox({ checked: e }) {
		return "<input " + (e ? "checked=\"\" " : "") + "disabled=\"\" type=\"checkbox\"> ";
	}
	paragraph({ tokens: e }) {
		return `<p>${this.parser.parseInline(e)}</p>
`;
	}
	table(e) {
		let t = "", n = "";
		for (let t = 0; t < e.header.length; t++) n += this.tablecell(e.header[t]);
		t += this.tablerow({ text: n });
		let r = "";
		for (let t = 0; t < e.rows.length; t++) {
			let i = e.rows[t];
			n = "";
			for (let e = 0; e < i.length; e++) n += this.tablecell(i[e]);
			r += this.tablerow({ text: n });
		}
		return r &&= `<tbody>${r}</tbody>`, "<table>\n<thead>\n" + t + "</thead>\n" + r + "</table>\n";
	}
	tablerow({ text: e }) {
		return `<tr>
${e}</tr>
`;
	}
	tablecell(e) {
		let t = this.parser.parseInline(e.tokens), n = e.header ? "th" : "td";
		return (e.align ? `<${n} align="${e.align}">` : `<${n}>`) + t + `</${n}>
`;
	}
	strong({ tokens: e }) {
		return `<strong>${this.parser.parseInline(e)}</strong>`;
	}
	em({ tokens: e }) {
		return `<em>${this.parser.parseInline(e)}</em>`;
	}
	codespan({ text: e }) {
		return `<code>${Dn(e, !0)}</code>`;
	}
	br(e) {
		return "<br>";
	}
	del({ tokens: e }) {
		return `<del>${this.parser.parseInline(e)}</del>`;
	}
	link({ href: e, title: t, tokens: n }) {
		let r = this.parser.parseInline(n), i = On(e);
		if (i === null) return r;
		e = i;
		let a = "<a href=\"" + e + "\"";
		return t && (a += " title=\"" + Dn(t) + "\""), a += ">" + r + "</a>", a;
	}
	image({ href: e, title: t, text: n, tokens: r }) {
		r && (n = this.parser.parseInline(r, this.parser.textRenderer));
		let i = On(e);
		if (i === null) return Dn(n);
		e = i;
		let a = `<img src="${e}" alt="${Dn(n)}"`;
		return t && (a += ` title="${Dn(t)}"`), a += ">", a;
	}
	text(e) {
		return "tokens" in e && e.tokens ? this.parser.parseInline(e.tokens) : "escaped" in e && e.escaped ? e.text : Dn(e.text);
	}
}, zn = class {
	strong({ text: e }) {
		return e;
	}
	em({ text: e }) {
		return e;
	}
	codespan({ text: e }) {
		return e;
	}
	del({ text: e }) {
		return e;
	}
	html({ text: e }) {
		return e;
	}
	text({ text: e }) {
		return e;
	}
	link({ text: e }) {
		return "" + e;
	}
	image({ text: e }) {
		return "" + e;
	}
	br() {
		return "";
	}
	checkbox({ raw: e }) {
		return e;
	}
}, Bn = class e {
	options;
	renderer;
	textRenderer;
	constructor(e) {
		this.options = e || ft, this.options.renderer = this.options.renderer || new Rn(), this.renderer = this.options.renderer, this.renderer.options = this.options, this.renderer.parser = this, this.textRenderer = new zn();
	}
	static parse(t, n) {
		return new e(n).parse(t);
	}
	static parseInline(t, n) {
		return new e(n).parseInline(t);
	}
	parse(e) {
		this.renderer.parser = this;
		let t = "";
		for (let n = 0; n < e.length; n++) {
			let r = e[n];
			if (this.options.extensions?.renderers?.[r.type]) {
				let e = r, n = this.options.extensions.renderers[e.type].call({ parser: this }, e);
				if (n !== !1 || ![
					"space",
					"hr",
					"heading",
					"code",
					"table",
					"blockquote",
					"list",
					"checkbox",
					"html",
					"def",
					"paragraph",
					"text"
				].includes(e.type)) {
					t += n || "";
					continue;
				}
			}
			let i = r;
			switch (i.type) {
				case "space":
					t += this.renderer.space(i);
					break;
				case "hr":
					t += this.renderer.hr(i);
					break;
				case "heading":
					t += this.renderer.heading(i);
					break;
				case "code":
					t += this.renderer.code(i);
					break;
				case "table":
					t += this.renderer.table(i);
					break;
				case "blockquote":
					t += this.renderer.blockquote(i);
					break;
				case "list":
					t += this.renderer.list(i);
					break;
				case "checkbox":
					t += this.renderer.checkbox(i);
					break;
				case "html":
					t += this.renderer.html(i);
					break;
				case "def":
					t += this.renderer.def(i);
					break;
				case "paragraph":
					t += this.renderer.paragraph(i);
					break;
				case "text":
					t += this.renderer.text(i);
					break;
				default: {
					let e = "Token with \"" + i.type + "\" type was not found.";
					if (this.options.silent) return console.error(e), "";
					throw Error(e);
				}
			}
		}
		return t;
	}
	parseInline(e, t = this.renderer) {
		this.renderer.parser = this;
		let n = "";
		for (let r = 0; r < e.length; r++) {
			let i = e[r];
			if (this.options.extensions?.renderers?.[i.type]) {
				let e = this.options.extensions.renderers[i.type].call({ parser: this }, i);
				if (e !== !1 || ![
					"escape",
					"html",
					"link",
					"image",
					"checkbox",
					"strong",
					"em",
					"codespan",
					"br",
					"del",
					"text"
				].includes(i.type)) {
					n += e || "";
					continue;
				}
			}
			let a = i;
			switch (a.type) {
				case "escape":
					n += t.text(a);
					break;
				case "html":
					n += t.html(a);
					break;
				case "link":
					n += t.link(a);
					break;
				case "image":
					n += t.image(a);
					break;
				case "checkbox":
					n += t.checkbox(a);
					break;
				case "strong":
					n += t.strong(a);
					break;
				case "em":
					n += t.em(a);
					break;
				case "codespan":
					n += t.codespan(a);
					break;
				case "br":
					n += t.br(a);
					break;
				case "del":
					n += t.del(a);
					break;
				case "text":
					n += t.text(a);
					break;
				default: {
					let e = "Token with \"" + a.type + "\" type was not found.";
					if (this.options.silent) return console.error(e), "";
					throw Error(e);
				}
			}
		}
		return n;
	}
}, Vn = class {
	options;
	block;
	constructor(e) {
		this.options = e || ft;
	}
	static passThroughHooks = /* @__PURE__ */ new Set([
		"preprocess",
		"postprocess",
		"processAllTokens",
		"emStrongMask"
	]);
	static passThroughHooksRespectAsync = /* @__PURE__ */ new Set([
		"preprocess",
		"postprocess",
		"processAllTokens"
	]);
	preprocess(e) {
		return e;
	}
	postprocess(e) {
		return e;
	}
	processAllTokens(e) {
		return e;
	}
	emStrongMask(e) {
		return e;
	}
	provideLexer(e = this.block) {
		return e ? Ln.lex : Ln.lexInline;
	}
	provideParser(e = this.block) {
		return e ? Bn.parse : Bn.parseInline;
	}
}, Hn = new class {
	defaults = dt();
	options = this.setOptions;
	parse = this.parseMarkdown(!0);
	parseInline = this.parseMarkdown(!1);
	Parser = Bn;
	Renderer = Rn;
	TextRenderer = zn;
	Lexer = Ln;
	Tokenizer = In;
	Hooks = Vn;
	constructor(...e) {
		this.use(...e);
	}
	walkTokens(e, t) {
		let n = [];
		for (let r of e) switch (n = n.concat(t.call(this, r)), r.type) {
			case "table": {
				let e = r;
				for (let r of e.header) n = n.concat(this.walkTokens(r.tokens, t));
				for (let r of e.rows) for (let e of r) n = n.concat(this.walkTokens(e.tokens, t));
				break;
			}
			case "list": {
				let e = r;
				n = n.concat(this.walkTokens(e.items, t));
				break;
			}
			default: {
				let e = r;
				this.defaults.extensions?.childTokens?.[e.type] ? this.defaults.extensions.childTokens[e.type].forEach((r) => {
					let i = e[r].flat(Infinity);
					n = n.concat(this.walkTokens(i, t));
				}) : e.tokens && (n = n.concat(this.walkTokens(e.tokens, t)));
			}
		}
		return n;
	}
	use(...e) {
		let t = this.defaults.extensions || {
			renderers: {},
			childTokens: {}
		};
		return e.forEach((e) => {
			let n = { ...e };
			if (n.async = this.defaults.async || n.async || !1, e.extensions && (e.extensions.forEach((e) => {
				if (!e.name) throw Error("extension name required");
				if ("renderer" in e) {
					let n = t.renderers[e.name];
					n ? t.renderers[e.name] = function(...t) {
						let r = e.renderer.apply(this, t);
						return r === !1 && (r = n.apply(this, t)), r;
					} : t.renderers[e.name] = e.renderer;
				}
				if ("tokenizer" in e) {
					if (!e.level || e.level !== "block" && e.level !== "inline") throw Error("extension level must be 'block' or 'inline'");
					let n = t[e.level];
					n ? n.unshift(e.tokenizer) : t[e.level] = [e.tokenizer], e.start && (e.level === "block" ? t.startBlock ? t.startBlock.push(e.start) : t.startBlock = [e.start] : e.level === "inline" && (t.startInline ? t.startInline.push(e.start) : t.startInline = [e.start]));
				}
				"childTokens" in e && e.childTokens && (t.childTokens[e.name] = e.childTokens);
			}), n.extensions = t), e.renderer) {
				let t = this.defaults.renderer || new Rn(this.defaults);
				for (let n in e.renderer) {
					if (!(n in t)) throw Error(`renderer '${n}' does not exist`);
					if (["options", "parser"].includes(n)) continue;
					let r = n, i = e.renderer[r], a = t[r];
					t[r] = (...e) => {
						let n = i.apply(t, e);
						return n === !1 && (n = a.apply(t, e)), n || "";
					};
				}
				n.renderer = t;
			}
			if (e.tokenizer) {
				let t = this.defaults.tokenizer || new In(this.defaults);
				for (let n in e.tokenizer) {
					if (!(n in t)) throw Error(`tokenizer '${n}' does not exist`);
					if ([
						"options",
						"rules",
						"lexer"
					].includes(n)) continue;
					let r = n, i = e.tokenizer[r], a = t[r];
					t[r] = (...e) => {
						let n = i.apply(t, e);
						return n === !1 && (n = a.apply(t, e)), n;
					};
				}
				n.tokenizer = t;
			}
			if (e.hooks) {
				let t = this.defaults.hooks || new Vn();
				for (let n in e.hooks) {
					if (!(n in t)) throw Error(`hook '${n}' does not exist`);
					if (["options", "block"].includes(n)) continue;
					let r = n, i = e.hooks[r], a = t[r];
					t[r] = Vn.passThroughHooks.has(n) ? (e) => {
						if (this.defaults.async && Vn.passThroughHooksRespectAsync.has(n)) return (async () => {
							let n = await i.call(t, e);
							return a.call(t, n);
						})();
						let r = i.call(t, e);
						return a.call(t, r);
					} : (...e) => {
						if (this.defaults.async) return (async () => {
							let n = await i.apply(t, e);
							return n === !1 && (n = await a.apply(t, e)), n;
						})();
						let n = i.apply(t, e);
						return n === !1 && (n = a.apply(t, e)), n;
					};
				}
				n.hooks = t;
			}
			if (e.walkTokens) {
				let t = this.defaults.walkTokens, r = e.walkTokens;
				n.walkTokens = function(e) {
					let n = [];
					return n.push(r.call(this, e)), t && (n = n.concat(t.call(this, e))), n;
				};
			}
			this.defaults = {
				...this.defaults,
				...n
			};
		}), this;
	}
	setOptions(e) {
		return this.defaults = {
			...this.defaults,
			...e
		}, this;
	}
	lexer(e, t) {
		return Ln.lex(e, t ?? this.defaults);
	}
	parser(e, t) {
		return Bn.parse(e, t ?? this.defaults);
	}
	parseMarkdown(e) {
		return (t, n) => {
			let r = { ...n }, i = {
				...this.defaults,
				...r
			}, a = this.onError(!!i.silent, !!i.async);
			if (this.defaults.async === !0 && r.async === !1) return a(/* @__PURE__ */ Error("marked(): The async option was set to true by an extension. Remove async: false from the parse options object to return a Promise."));
			if (typeof t > "u" || t === null) return a(/* @__PURE__ */ Error("marked(): input parameter is undefined or null"));
			if (typeof t != "string") return a(/* @__PURE__ */ Error("marked(): input parameter is of type " + Object.prototype.toString.call(t) + ", string expected"));
			if (i.hooks && (i.hooks.options = i, i.hooks.block = e), i.async) return (async () => {
				let n = i.hooks ? await i.hooks.preprocess(t) : t, r = await (i.hooks ? await i.hooks.provideLexer(e) : e ? Ln.lex : Ln.lexInline)(n, i), a = i.hooks ? await i.hooks.processAllTokens(r) : r;
				i.walkTokens && await Promise.all(this.walkTokens(a, i.walkTokens));
				let o = await (i.hooks ? await i.hooks.provideParser(e) : e ? Bn.parse : Bn.parseInline)(a, i);
				return i.hooks ? await i.hooks.postprocess(o) : o;
			})().catch(a);
			try {
				i.hooks && (t = i.hooks.preprocess(t));
				let n = (i.hooks ? i.hooks.provideLexer(e) : e ? Ln.lex : Ln.lexInline)(t, i);
				i.hooks && (n = i.hooks.processAllTokens(n)), i.walkTokens && this.walkTokens(n, i.walkTokens);
				let r = (i.hooks ? i.hooks.provideParser(e) : e ? Bn.parse : Bn.parseInline)(n, i);
				return i.hooks && (r = i.hooks.postprocess(r)), r;
			} catch (e) {
				return a(e);
			}
		};
	}
	onError(e, t) {
		return (n) => {
			if (n.message += "\nPlease report this to https://github.com/markedjs/marked.", e) {
				let e = "<p>An error occurred:</p><pre>" + Dn(n.message + "", !0) + "</pre>";
				return t ? Promise.resolve(e) : e;
			}
			if (t) return Promise.reject(n);
			throw n;
		};
	}
}();
function Q(e, t) {
	return Hn.parse(e, t);
}
Q.options = Q.setOptions = function(e) {
	return Hn.setOptions(e), Q.defaults = Hn.defaults, pt(Q.defaults), Q;
}, Q.getDefaults = dt, Q.defaults = ft;
function Un(...e) {
	return Hn.use(...e), Q.defaults = Hn.defaults, pt(Q.defaults), Q;
}
Q.use = Un, Q.walkTokens = function(e, t) {
	return Hn.walkTokens(e, t);
}, Q.parseInline = Hn.parseInline, Q.Parser = Bn, Q.parser = Bn.parse, Q.Renderer = Rn, Q.TextRenderer = zn, Q.Lexer = Ln, Q.lexer = Ln.lex, Q.Tokenizer = In, Q.Hooks = Vn, Q.parse = Q, Q.options, Q.setOptions, Q.walkTokens, Q.parseInline, Bn.parse, Ln.lex;
//#endregion
//#region resources/js/composables/useAiChat.ts
function Wn(e, t) {
	let r = _(null), i = _([]), a = _([]), o = _(!1), s = _(!1), c = _(!1), l = _(null), u = n(() => r.value !== null);
	function d() {
		r.value = null, i.value = [], a.value = [], o.value = !1, s.value = !1, c.value = !1, l.value = null;
	}
	function f() {
		r.value = null, i.value = [], l.value = null;
	}
	async function p() {
		o.value = !0;
		try {
			let { data: t } = await e.get(k.conversations);
			a.value = t.conversations;
		} catch {} finally {
			o.value = !1;
		}
	}
	async function m(n) {
		s.value = !0, l.value = null;
		try {
			let { data: t } = await e.get(k.conversation(n));
			r.value = t.conversation.id, i.value = t.messages;
		} catch (e) {
			let n = $(e, "Unable to load this conversation.");
			l.value = n, t("error", n);
		} finally {
			s.value = !1;
		}
	}
	async function h(t) {
		let n = t.trim();
		if (!n || c.value) return;
		l.value = null, c.value = !0;
		let a = {
			id: -Date.now(),
			role: "user",
			content: n,
			created_at: (/* @__PURE__ */ new Date()).toISOString()
		};
		i.value.push(a);
		try {
			let { data: t } = await e.post(k.chat, {
				conversation_id: r.value,
				message: n
			});
			r.value = t.conversation.id, i.value = i.value.map((e) => e.id === a.id ? {
				...a,
				id: a.id
			} : e), i.value.push(t.message), p();
		} catch (e) {
			i.value = i.value.filter((e) => e.id !== a.id), l.value = $(e, "The assistant could not respond. Please try again.");
		} finally {
			c.value = !1;
		}
	}
	async function g(n, r) {
		let i = r.trim();
		if (i) try {
			await e.patch(k.conversation(n), { title: i });
			let t = a.value.find((e) => e.id === n);
			t && (t.title = i);
		} catch (e) {
			t("error", $(e, "Unable to rename this conversation."));
		}
	}
	async function v(n) {
		try {
			await e.delete(k.conversation(n)), a.value = a.value.filter((e) => e.id !== n), r.value === n && f();
		} catch (e) {
			t("error", $(e, "Unable to delete this conversation."));
		}
	}
	return {
		currentConversationId: r,
		messages: i,
		conversations: a,
		isLoadingConversations: o,
		isLoadingConversation: s,
		isSending: c,
		lastError: l,
		hasActiveConversation: u,
		reset: d,
		newConversation: f,
		refreshConversations: p,
		loadConversation: m,
		sendMessage: h,
		renameConversation: g,
		deleteConversation: v
	};
}
function $(e, t) {
	if (typeof e == "object" && e && "response" in e) {
		let t = e.response;
		if (typeof t?.data?.message == "string") return t.data.message;
	}
	return e instanceof Error && e.message ? e.message : t;
}
//#endregion
//#region resources/js/components/AiChatOverlay.vue?vue&type=script&setup=true&lang.ts
var Gn = {
	key: 1,
	class: "fixed inset-y-0 right-0 z-50 flex bg-surface shadow-2xl max-sm:w-full sm:max-lg:w-[480px] lg:w-[640px]",
	"aria-label": "AI Assistant"
}, Kn = { class: "w-52 shrink-0 border-r border-line-default bg-surface-secondary max-sm:hidden sm:flex sm:flex-col" }, qn = { class: "flex-1 overflow-y-auto p-2" }, Jn = {
	key: 0,
	class: "p-2 text-xs text-muted"
}, Yn = {
	key: 1,
	class: "p-2 text-xs text-muted"
}, Xn = {
	key: 2,
	class: "space-y-1"
}, Zn = ["onClick"], Qn = { class: "hidden shrink-0 group-hover:flex" }, $n = ["onClick"], er = ["onClick"], tr = { class: "flex min-w-0 flex-1 flex-col" }, nr = { class: "flex h-14 items-center justify-between border-b border-line-default px-3" }, rr = { class: "flex items-center gap-2" }, ir = { class: "flex items-center gap-1" }, ar = {
	key: 0,
	class: "border-b border-line-default bg-surface-secondary p-2 sm:hidden"
}, or = { class: "max-h-48 overflow-y-auto" }, sr = ["onClick"], cr = {
	key: 0,
	class: "p-2 text-xs text-muted"
}, lr = {
	key: 0,
	class: "py-12 text-center text-sm text-muted"
}, ur = {
	key: 1,
	class: "mx-auto mt-16 max-w-xs text-center text-sm text-muted"
}, dr = {
	key: 0,
	class: "max-w-[85%] whitespace-pre-wrap break-words rounded-lg bg-primary-500 px-4 py-2 text-sm text-white"
}, fr = ["innerHTML"], pr = {
	key: 2,
	class: "inline-flex rounded-lg bg-surface-tertiary px-4 py-2 text-sm italic text-muted"
}, mr = {
	key: 3,
	class: "rounded bg-alert-error-bg p-3 text-xs text-alert-error-text"
}, hr = ["disabled"], gr = ["disabled"], _r = /* @__PURE__ */ l({
	__name: "AiChatOverlay",
	props: /*@__PURE__*/ d({
		client: { type: [Function, Object] },
		enabled: { type: Boolean },
		notify: { type: Function }
	}, {
		open: {
			type: Boolean,
			default: !1
		},
		openModifiers: {}
	}),
	emits: ["update:open"],
	setup(n) {
		let s = n, l = S(n, "open"), u = Wn(s.client, s.notify), d = _(""), m = _(null), g = _(!1), C = _(null), w = _("");
		E(l, (e) => {
			e && s.enabled && u.refreshConversations();
		}), E(() => s.enabled, (e) => {
			e || (l.value = !1, u.reset());
		}), E(() => u.messages.value.length, async () => {
			await f(), m.value && (m.value.scrollTop = m.value.scrollHeight);
		});
		function ee() {
			l.value = !1, g.value = !1;
		}
		async function te(e) {
			await u.loadConversation(e.id), g.value = !1;
		}
		async function ne() {
			let e = d.value;
			d.value = "", await u.sendMessage(e);
		}
		function k(e, t) {
			t.stopPropagation(), C.value = e.id, w.value = e.title ?? "";
		}
		async function ie() {
			C.value !== null && await u.renameConversation(C.value, w.value), C.value = null, w.value = "";
		}
		async function A(e, t) {
			t.stopPropagation(), window.confirm(`Delete “${e.title ?? "Untitled conversation"}”?`) && await u.deleteConversation(e.id);
		}
		function ae() {
			u.newConversation(), g.value = !1;
		}
		function j(e) {
			e.key === "Enter" && !e.shiftKey && (e.preventDefault(), ne());
		}
		function M(e) {
			return ut.sanitize(Q.parse(e ?? "", { async: !1 }));
		}
		return (s, f) => {
			let _ = y("BaseIcon");
			return h(), r(t, { to: "body" }, [l.value ? (h(), a("button", {
				key: 0,
				type: "button",
				class: "fixed inset-0 z-40 cursor-default bg-black/20",
				"aria-label": "Close AI Assistant",
				onClick: ee
			})) : i("", !0), l.value ? (h(), a("aside", Gn, [o("section", Kn, [o("div", { class: "border-b border-line-default p-3" }, [o("button", {
				type: "button",
				class: "w-full rounded-md bg-btn-primary px-3 py-2 text-xs font-medium text-white hover:bg-btn-primary-hover",
				onClick: ae
			}, " + New conversation ")]), o("div", qn, [x(u).isLoadingConversations.value && !x(u).conversations.value.length ? (h(), a("p", Jn, "Loading history…")) : x(u).conversations.value.length ? (h(), a("ul", Xn, [(h(!0), a(e, null, v(x(u).conversations.value, (e) => (h(), a("li", { key: e.id }, [C.value === e.id ? (h(), a("form", {
				key: 0,
				class: "flex gap-1 p-1",
				onSubmit: re(ie, ["prevent"])
			}, [D(o("input", {
				"onUpdate:modelValue": f[0] ||= (e) => w.value = e,
				class: "min-w-0 flex-1 rounded border border-line-default bg-surface px-2 py-1 text-xs text-body",
				"aria-label": "Conversation title",
				autofocus: "",
				onKeydown: f[1] ||= O((e) => C.value = null, ["esc"])
			}, null, 544), [[T, w.value]]), f[4] ||= o("button", {
				type: "submit",
				class: "rounded px-1 text-xs text-primary-500 hover:bg-hover",
				"aria-label": "Save conversation title"
			}, "Save", -1)], 32)) : (h(), a("div", {
				key: 1,
				class: p(["group flex items-center gap-1 rounded text-sm hover:bg-hover", x(u).currentConversationId.value === e.id ? "bg-hover-strong font-semibold text-heading" : "text-body"])
			}, [o("button", {
				type: "button",
				class: "min-w-0 flex-1 truncate px-2 py-2 text-left",
				onClick: (t) => te(e)
			}, b(e.title || "Untitled conversation"), 9, Zn), o("span", Qn, [o("button", {
				type: "button",
				class: "px-1 text-muted hover:text-heading",
				"aria-label": "Rename conversation",
				onClick: (t) => k(e, t)
			}, "✎", 8, $n), o("button", {
				type: "button",
				class: "px-1 text-muted hover:text-alert-error-text",
				"aria-label": "Delete conversation",
				onClick: (t) => A(e, t)
			}, "×", 8, er)])], 2))]))), 128))])) : (h(), a("p", Yn, "No conversations yet."))])]), o("section", tr, [
				o("header", nr, [o("div", rr, [
					o("button", {
						type: "button",
						class: "rounded p-1 text-muted hover:bg-hover hover:text-heading sm:hidden",
						"aria-label": "Conversation history",
						onClick: f[2] ||= (e) => g.value = !g.value
					}, [c(_, {
						name: "Bars3Icon",
						class: "h-5 w-5"
					})]),
					c(_, {
						name: "SparklesIcon",
						class: "h-5 w-5 text-primary-500"
					}),
					f[5] ||= o("h2", { class: "text-sm font-semibold text-heading" }, "AI Assistant", -1)
				]), o("div", ir, [o("button", {
					type: "button",
					class: "rounded p-2 text-muted hover:bg-hover hover:text-heading",
					"aria-label": "New conversation",
					title: "New conversation",
					onClick: ae
				}, [c(_, {
					name: "PlusIcon",
					class: "h-4 w-4"
				})]), o("button", {
					type: "button",
					class: "rounded p-2 text-muted hover:bg-hover hover:text-heading",
					"aria-label": "Close AI Assistant",
					onClick: ee
				}, [c(_, {
					name: "XMarkIcon",
					class: "h-5 w-5"
				})])])]),
				g.value ? (h(), a("div", ar, [o("button", {
					type: "button",
					class: "mb-2 w-full rounded-md bg-btn-primary px-3 py-2 text-xs font-medium text-white",
					onClick: ae
				}, "+ New conversation"), o("div", or, [(h(!0), a(e, null, v(x(u).conversations.value, (e) => (h(), a("button", {
					key: e.id,
					type: "button",
					class: "block w-full truncate rounded px-2 py-2 text-left text-sm text-body hover:bg-hover",
					onClick: (t) => te(e)
				}, b(e.title || "Untitled conversation"), 9, sr))), 128)), x(u).conversations.value.length ? i("", !0) : (h(), a("p", cr, "No conversations yet."))])])) : i("", !0),
				o("main", {
					ref_key: "messagesEl",
					ref: m,
					class: "flex-1 space-y-3 overflow-y-auto p-4",
					"aria-live": "polite"
				}, [
					x(u).isLoadingConversation.value ? (h(), a("div", lr, "Loading conversation…")) : x(u).messages.value.length ? i("", !0) : (h(), a("div", ur, [c(_, {
						name: "SparklesIcon",
						class: "mx-auto mb-3 h-10 w-10 text-subtle"
					}), f[6] ||= o("p", null, "Ask for help with invoices, customers, or your business.", -1)])),
					(h(!0), a(e, null, v(x(u).messages.value, (e) => (h(), a("article", {
						key: e.id,
						class: p(["flex", e.role === "user" ? "justify-end" : "justify-start"])
					}, [e.role === "user" ? (h(), a("p", dr, b(e.content), 1)) : (h(), a("div", {
						key: 1,
						class: "max-w-[85%] break-words rounded-lg bg-surface-tertiary px-4 py-2 text-sm text-body [&_a]:text-primary-500 [&_a]:underline [&_ol]:mt-3 [&_ol]:list-decimal [&_ol]:pl-5 [&_p+p]:mt-3 [&_pre]:mt-3 [&_pre]:overflow-x-auto [&_pre]:rounded [&_pre]:bg-surface [&_pre]:p-3 [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:pl-5",
						innerHTML: M(e.content)
					}, null, 8, fr))], 2))), 128)),
					x(u).isSending.value ? (h(), a("div", pr, "Thinking…")) : i("", !0),
					x(u).lastError.value ? (h(), a("p", mr, b(x(u).lastError.value), 1)) : i("", !0)
				], 512),
				o("form", {
					class: "flex items-end gap-2 border-t border-line-default p-3",
					onSubmit: re(ne, ["prevent"])
				}, [D(o("textarea", {
					"onUpdate:modelValue": f[3] ||= (e) => d.value = e,
					rows: "2",
					class: "min-h-11 flex-1 resize-none rounded-md border border-line-default bg-surface px-3 py-2 text-sm text-body outline-none focus:ring-1 focus:ring-primary-500",
					placeholder: "Ask about your business…",
					disabled: !n.enabled || x(u).isSending.value,
					onKeydown: j
				}, null, 40, hr), [[T, d.value]]), o("button", {
					type: "submit",
					class: "rounded-md bg-btn-primary px-3 py-2 text-sm font-medium text-white hover:bg-btn-primary-hover disabled:cursor-not-allowed disabled:opacity-50",
					disabled: !n.enabled || x(u).isSending.value || !d.value.trim()
				}, b(x(u).isSending.value ? "Sending…" : "Send"), 9, gr)], 32)
			])])) : i("", !0)]);
		};
	}
}), vr = /* @__PURE__ */ l({
	__name: "AiHeaderAction",
	emits: ["open"],
	setup(e) {
		return (e, t) => {
			let n = y("BaseIcon");
			return h(), a("li", null, [o("button", {
				type: "button",
				class: "inline-flex items-center gap-1 rounded-md px-2 py-1 text-sm text-body hover:bg-hover",
				title: "AI Assistant",
				"aria-label": "Open AI Assistant",
				onClick: t[0] ||= (t) => e.$emit("open")
			}, [c(n, {
				name: "SparklesIcon",
				class: "h-5 w-5 text-primary-500"
			}), t[1] ||= o("span", { class: "max-lg:hidden lg:inline" }, "AI", -1)])]);
		};
	}
}), yr = ["disabled"], br = {
	class: "w-full max-w-xl overflow-hidden rounded-lg bg-surface shadow-2xl",
	role: "dialog",
	"aria-modal": "true",
	"aria-labelledby": "ai-generate-title"
}, xr = { class: "flex items-center justify-between border-b border-line-default px-5 py-4" }, Sr = { class: "flex items-center gap-2" }, Cr = ["disabled"], wr = ["disabled"], Tr = {
	key: 0,
	class: "flex cursor-pointer items-start gap-2 text-sm text-body"
}, Er = {
	key: 1,
	class: "rounded bg-alert-error-bg p-3 text-sm text-alert-error-text"
}, Dr = {
	key: 2,
	class: "rounded-md border border-line-default bg-surface-secondary p-3"
}, Or = { class: "max-h-48 overflow-y-auto whitespace-pre-wrap break-words text-sm text-body" }, kr = { class: "flex flex-wrap justify-end gap-2 border-t border-line-default p-4" }, Ar = ["disabled"], jr = ["disabled"], Mr = ["disabled"], Nr = ["disabled"], Pr = ["disabled"], Fr = /* @__PURE__ */ l({
	__name: "AiTextAction",
	props: {
		client: { type: [Function, Object] },
		context: {},
		enabled: { type: Boolean },
		notify: { type: Function }
	},
	setup(l) {
		let u = l, d = _(!1), f = _(""), p = _(!1), m = _(""), g = _(!1), v = _(""), x = n(() => m.value.trim().length > 0);
		E(d, (e) => {
			e || (f.value = "", p.value = !1, m.value = "", v.value = "");
		});
		async function S() {
			if (!(!f.value.trim() || g.value)) {
				g.value = !0, v.value = "", m.value = "";
				try {
					let { data: e } = await u.client.post(k.generate, {
						prompt: f.value.trim(),
						context: p.value ? u.context.getHtml() : void 0
					});
					e.text ? m.value = e.text : v.value = e.message ?? e.error ?? "The assistant could not generate text.";
				} catch (e) {
					v.value = $(e, "The assistant could not generate text.");
				} finally {
					g.value = !1;
				}
			}
		}
		function w() {
			u.context.insertContent(m.value), u.notify("success", "AI text inserted."), d.value = !1;
		}
		function ee() {
			u.context.replaceContent(m.value), u.notify("success", "Editor content replaced with AI text."), d.value = !1;
		}
		return (n, u) => {
			let _ = y("BaseIcon");
			return h(), a(e, null, [o("button", {
				type: "button",
				class: "inline-flex items-center gap-1 rounded px-2 py-1 text-xs text-body hover:bg-hover disabled:cursor-not-allowed disabled:opacity-50",
				disabled: !l.enabled,
				title: "Generate with AI",
				onClick: u[0] ||= (e) => d.value = !0
			}, [c(_, {
				name: "SparklesIcon",
				class: "h-4 w-4 text-primary-500"
			}), u[6] ||= s(" AI write ", -1)], 8, yr), (h(), r(t, { to: "body" }, [d.value ? (h(), a("div", {
				key: 0,
				class: "fixed inset-0 z-50 grid place-items-center bg-black/30 p-4",
				role: "presentation",
				onMousedown: u[5] ||= re((e) => d.value = !1, ["self"])
			}, [o("section", br, [
				o("header", xr, [o("div", Sr, [c(_, {
					name: "SparklesIcon",
					class: "h-5 w-5 text-primary-500"
				}), u[7] ||= o("h2", {
					id: "ai-generate-title",
					class: "font-semibold text-heading"
				}, "Generate text", -1)]), o("button", {
					type: "button",
					class: "rounded p-1 text-muted hover:bg-hover hover:text-heading",
					"aria-label": "Close",
					disabled: g.value,
					onClick: u[1] ||= (e) => d.value = !1
				}, [c(_, {
					name: "XMarkIcon",
					class: "h-5 w-5"
				})], 8, Cr)]),
				o("form", {
					class: "space-y-4 p-5",
					onSubmit: re(S, ["prevent"])
				}, [
					u[11] ||= o("label", {
						class: "block text-sm font-medium text-heading",
						for: "ai-prompt"
					}, "What would you like to write?", -1),
					D(o("textarea", {
						id: "ai-prompt",
						"onUpdate:modelValue": u[2] ||= (e) => f.value = e,
						rows: "3",
						class: "w-full rounded-md border border-line-default bg-surface px-3 py-2 text-sm text-body outline-none focus:ring-1 focus:ring-primary-500",
						placeholder: "For example: Write a polite payment reminder",
						disabled: g.value,
						autofocus: ""
					}, null, 8, wr), [[T, f.value]]),
					l.context.getHtml() ? (h(), a("label", Tr, [
						D(o("input", {
							"onUpdate:modelValue": u[3] ||= (e) => p.value = e,
							type: "checkbox",
							class: "mt-1"
						}, null, 512), [[C, p.value]]),
						u[8] ||= s(),
						u[9] ||= o("span", null, [
							s("Use the current editor content as context"),
							o("br"),
							o("span", { class: "text-xs text-muted" }, "The content helps the assistant match the document’s tone and details.")
						], -1)
					])) : i("", !0),
					v.value ? (h(), a("p", Er, b(v.value), 1)) : i("", !0),
					m.value ? (h(), a("section", Dr, [u[10] ||= o("p", { class: "mb-2 text-xs font-medium text-muted" }, "Preview", -1), o("p", Or, b(m.value), 1)])) : i("", !0)
				], 32),
				o("footer", kr, [
					o("button", {
						type: "button",
						class: "rounded px-3 py-2 text-sm text-body hover:bg-hover",
						disabled: g.value,
						onClick: u[4] ||= (e) => d.value = !1
					}, "Cancel", 8, Ar),
					x.value ? (h(), a("button", {
						key: 0,
						type: "button",
						class: "rounded border border-line-default px-3 py-2 text-sm text-body hover:bg-hover",
						disabled: g.value,
						onClick: ee
					}, "Replace", 8, jr)) : i("", !0),
					x.value ? (h(), a("button", {
						key: 1,
						type: "button",
						class: "rounded border border-line-default px-3 py-2 text-sm text-body hover:bg-hover",
						disabled: g.value,
						onClick: S
					}, "Regenerate", 8, Mr)) : i("", !0),
					x.value ? (h(), a("button", {
						key: 2,
						type: "button",
						class: "rounded bg-btn-primary px-3 py-2 text-sm font-medium text-white hover:bg-btn-primary-hover",
						disabled: g.value,
						onClick: w
					}, "Insert", 8, Nr)) : (h(), a("button", {
						key: 3,
						type: "button",
						class: "rounded bg-btn-primary px-3 py-2 text-sm font-medium text-white hover:bg-btn-primary-hover disabled:cursor-not-allowed disabled:opacity-50",
						disabled: g.value || !f.value.trim(),
						onClick: S
					}, b(g.value ? "Generating…" : "Generate"), 9, Pr))
				])
			])], 32)) : i("", !0)]))], 64);
		};
	}
}), Ir = {
	key: 0,
	class: "p-6 text-sm text-muted"
}, Lr = {
	key: 1,
	class: "space-y-3 p-6"
}, Rr = { class: "rounded bg-alert-error-bg p-3 text-sm text-alert-error-text" }, zr = {
	key: 0,
	class: "border-b border-line-default pb-6"
}, Br = { class: "flex cursor-pointer items-start gap-3" }, Vr = ["checked", "disabled"], Hr = {
	key: 0,
	class: "mt-4 rounded bg-alert-success-bg p-3 text-sm text-alert-success-text"
}, Ur = {
	key: 1,
	class: "space-y-6"
}, Wr = { class: "flex cursor-pointer items-start gap-3" }, Gr = ["checked"], Kr = {
	key: 0,
	class: "space-y-5"
}, qr = { class: "block text-sm font-medium text-heading" }, Jr = ["value"], Yr = {
	key: 0,
	class: "-mt-3 text-xs text-muted"
}, Xr = {
	key: 1,
	class: "-mt-3 text-xs text-muted"
}, Zr = {
	key: 2,
	class: "-mt-3 text-xs text-muted"
}, Qr = ["href"], $r = {
	key: 3,
	class: "block text-sm font-medium text-heading"
}, ei = { class: "mt-1 flex gap-2" }, ti = ["type", "placeholder"], ni = [
	"value",
	"placeholder",
	"onInput"
], ri = ["value", "onChange"], ii = ["value"], ai = { class: "border-t border-line-default pt-5" }, oi = {
	key: 0,
	class: "mt-3 flex flex-wrap items-center gap-3 text-xs text-muted"
}, si = ["disabled"], ci = {
	key: 0,
	class: "text-alert-error-text"
}, li = { key: 1 }, ui = { key: 2 }, di = { class: "mt-5 space-y-5" }, fi = { class: "flex cursor-pointer gap-3" }, pi = ["checked"], mi = {
	key: 0,
	class: "mt-3 block text-sm text-body"
}, hi = ["value"], gi = { class: "flex cursor-pointer gap-3" }, _i = ["checked"], vi = {
	key: 0,
	class: "mt-3 block text-sm text-body"
}, yi = ["value"], bi = { id: "ai-models" }, xi = ["value"], Si = {
	key: 2,
	class: "flex flex-wrap items-center gap-3 border-t border-line-default pt-5"
}, Ci = ["disabled"], wi = ["disabled"], Ti = /* @__PURE__ */ l({
	__name: "AiConfigurationPage",
	props: {
		client: { type: [Function, Object] },
		scope: {},
		notify: { type: Function }
	},
	setup(t) {
		let l = t, u = {
			ai_enabled: "NO",
			ai_driver: "openrouter",
			ai_api_key: "",
			ai_base_url: "",
			ai_chat_enabled: "NO",
			ai_chat_model: "anthropic/claude-sonnet-4.6",
			ai_text_generation_enabled: "NO",
			ai_text_generation_model: "anthropic/claude-haiku-4.5"
		}, d = g({
			...u,
			use_custom_ai_config: "NO"
		}), p = _([]), x = _(!0), S = _(!1), C = _(!1), te = _(!1), O = _(""), ie = n(() => l.scope === "admin" ? k.globalConfig : k.companyConfig), A = n(() => l.scope === "admin" ? k.globalModels : k.companyModels), ae = n(() => l.scope === "admin" ? k.globalTest : k.companyTest), j = n(() => d.use_custom_ai_config === "YES"), M = n(() => d.ai_enabled === "YES"), N = n(() => p.value.find((e) => e.value === d.ai_driver)), oe = n(() => N.value?.suggested_models ?? []), se = n(() => N.value?.config_fields ?? []), ce = n(() => N.value?.requires_api_key ?? !0), le = n(() => N.value?.accepts_api_key === !0), ue = n(() => N.value?.fetches_models === !0), P = _([]), F = _(!1), I = _(""), de = n(() => se.value.some((e) => e.key === "base_url")), fe = n(() => /[•*]/.test(d.ai_api_key)), pe = n(() => l.scope === "admin" || j.value);
		E(() => d.ai_driver, (e, t) => {
			let n = p.value.find((t) => t.value === e), r = p.value.find((e) => e.value === t);
			(!d.ai_base_url || d.ai_base_url === r?.default_base_url) && (d.ai_base_url = n?.default_base_url ?? "");
		}), m(() => {
			me();
		});
		async function me() {
			x.value = !0, O.value = "";
			try {
				let [{ data: e }, { data: t }] = await Promise.all([l.client.get(k.drivers), l.client.get(ie.value)]);
				p.value = e.ai_drivers, Object.assign(d, u, t), d.ai_enabled === "YES" && N.value?.fetches_models && ge(!1);
			} catch (e) {
				O.value = $(e, "Unable to load AI configuration."), l.notify("error", O.value);
			} finally {
				x.value = !1;
			}
		}
		async function he() {
			P.value = [], I.value = "";
			let e = N.value?.suggested_models ?? [];
			if (N.value?.fetches_models) {
				d.ai_chat_model = "", d.ai_text_generation_model = "", await f(), ge(!0);
				return;
			}
			if (e.length === 0) return;
			let t = (t) => e.some((e) => e.value === t);
			t(d.ai_chat_model) || (d.ai_chat_model = e[0].value), t(d.ai_text_generation_model) || (d.ai_text_generation_model = (e[1] ?? e[0]).value);
		}
		async function ge(e) {
			if (!(F.value || !d.ai_driver)) {
				F.value = !0, I.value = "";
				try {
					let { data: t } = await l.client.post(A.value, {
						ai_driver: d.ai_driver,
						ai_api_key: fe.value ? void 0 : d.ai_api_key,
						ai_base_url: de.value ? d.ai_base_url : ""
					});
					P.value = t.models ?? [];
					let n = P.value[0]?.value ?? "", r = (e) => P.value.some((t) => t.value === e);
					n && !r(d.ai_chat_model) && (d.ai_chat_model = n), n && !r(d.ai_text_generation_model) && (d.ai_text_generation_model = n), (e || P.value.length === 0) && l.notify(P.value.length ? "success" : "warning", P.value.length ? `Found ${P.value.length} models.` : "The server did not list any models.");
				} catch (e) {
					P.value = [], I.value = $(e, "Unable to list the models."), l.notify("error", I.value);
				} finally {
					F.value = !1;
				}
			}
		}
		function _e(e) {
			let t = P.value;
			return e && !t.some((t) => t.value === e) ? [{
				value: e,
				label: `${e} (not offered by the server)`
			}, ...t] : t;
		}
		function ve() {
			return {
				...d,
				ai_base_url: de.value ? d.ai_base_url : ""
			};
		}
		function ye() {
			if (!M.value) return null;
			if (!d.ai_driver) return "Choose an AI provider.";
			if (ce.value && !d.ai_api_key && !fe.value) return "Enter an API key.";
			if (de.value && d.ai_base_url) try {
				new URL(d.ai_base_url);
			} catch {
				return "Enter a valid base URL.";
			}
			return d.ai_chat_enabled === "YES" && !d.ai_chat_model.trim() ? "Choose a chat model." : d.ai_text_generation_enabled === "YES" && !d.ai_text_generation_model.trim() ? "Choose a text generation model." : null;
		}
		async function be() {
			let e = ye();
			if (e) {
				l.notify("error", e);
				return;
			}
			S.value = !0;
			try {
				await l.client.post(ie.value, ve()), l.notify("success", "AI settings saved.");
			} catch (e) {
				l.notify("error", $(e, "Unable to save AI settings."));
			} finally {
				S.value = !1;
			}
		}
		async function xe(e) {
			let t = e.target.checked;
			if (d.use_custom_ai_config = t ? "YES" : "NO", !t) {
				S.value = !0;
				try {
					await l.client.post(ie.value, { use_custom_ai_config: "NO" }), l.notify("success", "This company now uses the global AI configuration.");
				} catch (e) {
					d.use_custom_ai_config = "YES", l.notify("error", $(e, "Unable to update the company configuration."));
				} finally {
					S.value = !1;
				}
			}
		}
		async function Se() {
			if (M.value) {
				C.value = !0;
				try {
					let { data: e } = await l.client.post(ae.value, {
						ai_driver: d.ai_driver,
						ai_api_key: fe.value ? void 0 : d.ai_api_key,
						ai_base_url: de.value ? d.ai_base_url : ""
					});
					e.success ? l.notify("success", e.message ?? "Connection successful.") : l.notify("error", e.message ?? e.error ?? "The connection test failed.");
				} catch (e) {
					l.notify("error", $(e, "The connection test failed."));
				} finally {
					C.value = !1;
				}
			}
		}
		function Ce(e, t) {
			d[e] = t.target.checked ? "YES" : "NO";
		}
		function we(e, t) {
			d[`ai_${e}`] = t.target.value;
		}
		return (n, l) => {
			let u = y("BasePageHeader"), f = y("BaseCard"), m = y("BasePage");
			return h(), r(m, null, {
				default: ne(() => [c(u, { title: t.scope === "admin" ? "AI Assistant" : "AI Assistant configuration" }, null, 8, ["title"]), c(f, { class: "max-w-3xl" }, {
					default: ne(() => [x.value ? (h(), a("div", Ir, "Loading AI configuration…")) : O.value ? (h(), a("div", Lr, [o("p", Rr, b(O.value), 1), o("button", {
						type: "button",
						class: "rounded bg-btn-primary px-3 py-2 text-sm text-white",
						onClick: me
					}, "Try again")])) : (h(), a("form", {
						key: 2,
						class: "space-y-6 p-6",
						onSubmit: re(be, ["prevent"])
					}, [
						t.scope === "company" ? (h(), a("section", zr, [o("label", Br, [o("input", {
							type: "checkbox",
							checked: j.value,
							disabled: S.value,
							onChange: xe
						}, null, 40, Vr), l[11] ||= o("span", null, [o("span", { class: "block text-sm font-medium text-heading" }, "Use a company-specific AI configuration"), o("span", { class: "mt-1 block text-xs text-muted" }, "Override the global provider and models for this company.")], -1)]), j.value ? i("", !0) : (h(), a("p", Hr, "This company is using the global AI configuration."))])) : i("", !0),
						pe.value ? (h(), a("div", Ur, [o("section", null, [o("label", Wr, [o("input", {
							type: "checkbox",
							checked: M.value,
							onChange: l[0] ||= (e) => Ce("ai_enabled", e)
						}, null, 40, Gr), l[12] ||= o("span", null, [o("span", { class: "block text-sm font-medium text-heading" }, "Enable AI Assistant"), o("span", { class: "mt-1 block text-xs text-muted" }, "Allow this provider to power chat and editor text generation.")], -1)])]), M.value ? (h(), a("div", Kr, [
							o("label", qr, [l[13] ||= s("Provider ", -1), D(o("select", {
								"onUpdate:modelValue": l[1] ||= (e) => d.ai_driver = e,
								class: "mt-1 w-full rounded-md border border-line-default bg-surface px-3 py-2 text-body",
								onChange: he
							}, [(h(!0), a(e, null, v(p.value, (e) => (h(), a("option", {
								key: e.value,
								value: e.value
							}, b(e.label), 9, Jr))), 128))], 544), [[ee, d.ai_driver]])]),
							le.value ? (h(), a("p", Yr, [...l[14] ||= [
								s("Any server that speaks the OpenAI API (Ollama, LM Studio, llama.cpp, vLLM, LiteLLM). A server on a private address must be listed by the operator in the ", -1),
								o("code", null, "AI_LOCAL_ALLOWED_HOSTS", -1),
								s(" environment variable. Chat tools need a model that supports tool calling.", -1)
							]])) : ce.value ? N.value?.website ? (h(), a("p", Zr, [
								l[16] ||= s("Get an API key from ", -1),
								o("a", {
									class: "text-primary-500 underline",
									href: N.value.website,
									target: "_blank",
									rel: "noopener noreferrer"
								}, b(N.value.label), 9, Qr),
								l[17] ||= s(".", -1)
							])) : i("", !0) : (h(), a("p", Xr, [...l[15] ||= [
								s("Uses the Claude subscription that the server's ", -1),
								o("code", null, "claude", -1),
								s(" CLI is logged in with (run ", -1),
								o("code", null, "claude login", -1),
								s(" as the web server user). No API key is stored.", -1)
							]])),
							ce.value || le.value ? (h(), a("label", $r, [
								s("API key" + b(ce.value ? "" : " (optional)") + " ", 1),
								o("span", ei, [D(o("input", {
									"onUpdate:modelValue": l[2] ||= (e) => d.ai_api_key = e,
									type: te.value ? "text" : "password",
									autocomplete: "new-password",
									class: "min-w-0 flex-1 rounded-md border border-line-default bg-surface px-3 py-2 text-body",
									placeholder: fe.value ? "Stored securely — enter a new key to replace it" : ""
								}, null, 8, ti), [[w, d.ai_api_key]]), o("button", {
									type: "button",
									class: "rounded border border-line-default px-3 text-xs text-body hover:bg-hover",
									onClick: l[3] ||= (e) => te.value = !te.value
								}, b(te.value ? "Hide" : "Show"), 1)]),
								l[18] ||= o("span", { class: "mt-1 block text-xs font-normal text-muted" }, "Keys are stored securely. Leave the masked value unchanged to keep the current key.", -1)
							])) : i("", !0),
							(h(!0), a(e, null, v(se.value, (t) => (h(), a("label", {
								key: t.key,
								class: "block text-sm font-medium text-heading"
							}, [s(b(t.label) + " ", 1), t.type === "text" ? (h(), a("input", {
								key: 0,
								value: d[`ai_${t.key}`] ?? "",
								placeholder: t.default,
								class: "mt-1 w-full rounded-md border border-line-default bg-surface px-3 py-2 text-body",
								onInput: (e) => we(t.key, e)
							}, null, 40, ni)) : (h(), a("select", {
								key: 1,
								value: d[`ai_${t.key}`] ?? "",
								class: "mt-1 w-full rounded-md border border-line-default bg-surface px-3 py-2 text-body",
								onChange: (e) => we(t.key, e)
							}, [(h(!0), a(e, null, v(t.options, (e) => (h(), a("option", {
								key: e.value,
								value: e.value
							}, b(e.label), 9, ii))), 128))], 40, ri))]))), 128)),
							o("section", ai, [
								l[23] ||= o("h2", { class: "text-sm font-semibold text-heading" }, "AI capabilities", -1),
								l[24] ||= o("p", { class: "mt-1 text-xs text-muted" }, "Enable only the AI tools your team needs, and choose a model for each one.", -1),
								ue.value ? (h(), a("div", oi, [o("button", {
									type: "button",
									class: "rounded border border-line-default px-3 py-1.5 text-body hover:bg-hover disabled:opacity-50",
									disabled: F.value,
									onClick: l[4] ||= (e) => ge(!0)
								}, b(F.value ? "Loading models…" : "Refresh models"), 9, si), I.value ? (h(), a("span", ci, b(I.value), 1)) : P.value.length ? (h(), a("span", li, b(P.value.length) + " models available from this server.", 1)) : F.value ? i("", !0) : (h(), a("span", ui, "Models are read from the server; set the URL (and key if needed) first."))])) : i("", !0),
								o("div", di, [o("div", null, [o("label", fi, [o("input", {
									type: "checkbox",
									checked: d.ai_chat_enabled === "YES",
									onChange: l[5] ||= (e) => Ce("ai_chat_enabled", e)
								}, null, 40, pi), l[19] ||= o("span", { class: "text-sm font-medium text-heading" }, [s("Assistant chat"), o("span", { class: "mt-1 block text-xs font-normal text-muted" }, "Show the conversational AI drawer in company pages.")], -1)]), d.ai_chat_enabled === "YES" ? (h(), a("label", mi, [l[20] ||= s("Chat model", -1), ue.value && P.value.length ? D((h(), a("select", {
									key: 0,
									"onUpdate:modelValue": l[6] ||= (e) => d.ai_chat_model = e,
									class: "mt-1 w-full rounded-md border border-line-default bg-surface px-3 py-2"
								}, [(h(!0), a(e, null, v(_e(d.ai_chat_model), (e) => (h(), a("option", {
									key: e.value,
									value: e.value
								}, b(e.label), 9, hi))), 128))], 512)), [[ee, d.ai_chat_model]]) : D((h(), a("input", {
									key: 1,
									"onUpdate:modelValue": l[7] ||= (e) => d.ai_chat_model = e,
									list: "ai-models",
									class: "mt-1 w-full rounded-md border border-line-default bg-surface px-3 py-2"
								}, null, 512)), [[T, d.ai_chat_model]])])) : i("", !0)]), o("div", null, [o("label", gi, [o("input", {
									type: "checkbox",
									checked: d.ai_text_generation_enabled === "YES",
									onChange: l[8] ||= (e) => Ce("ai_text_generation_enabled", e)
								}, null, 40, _i), l[21] ||= o("span", { class: "text-sm font-medium text-heading" }, [s("Editor text generation"), o("span", { class: "mt-1 block text-xs font-normal text-muted" }, "Add AI writing tools to rich-text editors.")], -1)]), d.ai_text_generation_enabled === "YES" ? (h(), a("label", vi, [l[22] ||= s("Text generation model", -1), ue.value && P.value.length ? D((h(), a("select", {
									key: 0,
									"onUpdate:modelValue": l[9] ||= (e) => d.ai_text_generation_model = e,
									class: "mt-1 w-full rounded-md border border-line-default bg-surface px-3 py-2"
								}, [(h(!0), a(e, null, v(_e(d.ai_text_generation_model), (e) => (h(), a("option", {
									key: e.value,
									value: e.value
								}, b(e.label), 9, yi))), 128))], 512)), [[ee, d.ai_text_generation_model]]) : D((h(), a("input", {
									key: 1,
									"onUpdate:modelValue": l[10] ||= (e) => d.ai_text_generation_model = e,
									list: "ai-models",
									class: "mt-1 w-full rounded-md border border-line-default bg-surface px-3 py-2"
								}, null, 512)), [[T, d.ai_text_generation_model]])])) : i("", !0)])]),
								o("datalist", bi, [(h(!0), a(e, null, v(oe.value, (e) => (h(), a("option", {
									key: e.value,
									value: e.value
								}, b(e.label), 9, xi))), 128))])
							])
						])) : i("", !0)])) : i("", !0),
						pe.value ? (h(), a("footer", Si, [o("button", {
							type: "submit",
							class: "rounded bg-btn-primary px-4 py-2 text-sm font-medium text-white hover:bg-btn-primary-hover disabled:opacity-50",
							disabled: S.value
						}, b(S.value ? "Saving…" : "Save settings"), 9, Ci), M.value ? (h(), a("button", {
							key: 0,
							type: "button",
							class: "rounded border border-line-default px-4 py-2 text-sm text-body hover:bg-hover disabled:opacity-50",
							disabled: S.value || C.value,
							onClick: Se
						}, b(C.value ? "Testing…" : "Test connection"), 9, wi)) : i("", !0)])) : i("", !0)
					], 32))]),
					_: 1
				})]),
				_: 1
			});
		};
	}
}), Ei = {
	key: 0,
	class: "p-6 text-sm text-muted"
}, Di = {
	key: 1,
	class: "space-y-3 p-6"
}, Oi = { class: "rounded bg-alert-error-bg p-3 text-sm text-alert-error-text" }, ki = {
	key: 2,
	class: "space-y-6 p-6"
}, Ai = { class: "text-sm text-muted" }, ji = {
	key: 0,
	class: "rounded border border-line-default p-4"
}, Mi = { class: "text-sm font-medium text-heading" }, Ni = { class: "mt-1 text-xs text-muted" }, Pi = ["onClick"], Fi = {
	key: 1,
	class: "space-y-3"
}, Ii = { class: "flex flex-wrap items-start justify-between gap-3" }, Li = { class: "min-w-0" }, Ri = { class: "text-sm font-medium text-heading" }, zi = { class: "mt-1 text-xs text-muted" }, Bi = { key: 0 }, Vi = { class: "flex cursor-pointer items-center gap-2 text-xs text-body" }, Hi = [
	"checked",
	"disabled",
	"onChange"
], Ui = { class: "mt-3 grid gap-x-6 gap-y-1 text-xs text-muted sm:grid-cols-2" }, Wi = { class: "inline text-body" }, Gi = { class: "inline text-body" }, Ki = {
	key: 0,
	class: "mt-2 rounded bg-alert-warning-bg p-2 text-xs text-alert-warning-text"
}, qi = { class: "mt-3 flex flex-wrap gap-2" }, Ji = ["disabled", "onClick"], Yi = ["onClick"], Xi = ["disabled", "onClick"], Zi = {
	key: 2,
	class: "flex flex-wrap gap-2"
}, Qi = ["onClick"], $i = { class: "text-sm font-semibold text-heading" }, ea = { class: "block text-sm font-medium text-heading" }, ta = { class: "block text-sm font-medium text-heading" }, na = { class: "mt-1 block text-xs font-normal text-muted" }, ra = { class: "grid gap-4 sm:grid-cols-3" }, ia = { class: "block text-sm font-medium text-heading" }, aa = ["value"], oa = {
	key: 0,
	class: "block text-sm font-medium text-heading"
}, sa = ["value"], ca = {
	key: 1,
	class: "block text-sm font-medium text-heading"
}, la = { class: "block text-sm font-medium text-heading" }, ua = { class: "flex cursor-pointer items-center gap-2 text-sm text-heading" }, da = { class: "flex gap-3" }, fa = ["disabled"], pa = /* @__PURE__ */ l({
	__name: "AiScheduledTasksPage",
	props: {
		client: { type: [Function, Object] },
		notify: { type: Function }
	},
	setup(t) {
		let l = t, u = [
			"Monday",
			"Tuesday",
			"Wednesday",
			"Thursday",
			"Friday",
			"Saturday",
			"Sunday"
		], d = [
			{
				value: "month_end",
				label: "Last day of every month"
			},
			{
				value: "monthly",
				label: "Monthly, on a set day"
			},
			{
				value: "weekly",
				label: "Weekly"
			},
			{
				value: "daily",
				label: "Every day"
			}
		], f = () => ({
			name: "",
			prompt: "",
			frequency: "month_end",
			day: null,
			run_at: "18:00",
			enabled: !0
		}), x = _([]), S = _([]), w = _("UTC"), E = _(!0), O = _(""), ie = _(!1), A = _(null), ae = _(null), j = _(!1), M = g(f()), N = n(() => M.frequency === "weekly" || M.frequency === "monthly");
		m(() => {
			oe();
		});
		async function oe() {
			E.value = !0, O.value = "";
			try {
				let { data: e } = await l.client.get(k.scheduledTasks);
				x.value = e.tasks, S.value = e.templates, w.value = e.timezone;
			} catch (e) {
				O.value = $(e, "Unable to load the scheduled tasks.");
			} finally {
				E.value = !1;
			}
		}
		function se(e) {
			Object.assign(M, f(), e ? {
				name: e.name,
				prompt: e.prompt,
				frequency: e.frequency,
				day: e.day,
				run_at: e.run_at
			} : {}), ae.value = null, j.value = !0;
		}
		function ce(e) {
			Object.assign(M, {
				name: e.name,
				prompt: e.prompt,
				frequency: e.frequency,
				day: e.day,
				run_at: e.run_at,
				enabled: e.enabled
			}), ae.value = e.id, j.value = !0;
		}
		function le() {
			M.day = M.frequency === "weekly" || M.frequency === "monthly" ? 1 : null;
		}
		async function ue() {
			if (!M.name.trim() || !M.prompt.trim()) {
				l.notify("error", "Give the task a name and a prompt.");
				return;
			}
			ie.value = !0;
			try {
				let e = {
					...M,
					name: M.name.trim(),
					day: N.value ? M.day : null
				};
				ae.value === null ? await l.client.post(k.scheduledTasks, e) : await l.client.put(k.scheduledTask(ae.value), e), l.notify("success", "Scheduled task saved."), j.value = !1, await oe();
			} catch (e) {
				l.notify("error", $(e, "Unable to save the scheduled task."));
			} finally {
				ie.value = !1;
			}
		}
		async function P(e) {
			A.value = e.id;
			try {
				await l.client.put(k.scheduledTask(e.id), { enabled: !e.enabled }), await oe();
			} catch (e) {
				l.notify("error", $(e, "Unable to update the task."));
			} finally {
				A.value = null;
			}
		}
		async function F(e) {
			A.value = e.id;
			try {
				let { data: t } = await l.client.post(k.scheduledTaskRun(e.id));
				l.notify("success", t.message ?? "Queued."), await oe();
			} catch (e) {
				l.notify("error", $(e, "Unable to run the task."));
			} finally {
				A.value = null;
			}
		}
		async function I(e) {
			if (window.confirm(`Delete “${e.name}”? Its past results stay in your conversations.`)) {
				A.value = e.id;
				try {
					await l.client.delete(k.scheduledTask(e.id)), await oe();
				} catch (e) {
					l.notify("error", $(e, "Unable to delete the task."));
				} finally {
					A.value = null;
				}
			}
		}
		function de(e) {
			let t = ` at ${e.run_at}`;
			return e.frequency === "month_end" ? `Last day of every month${t}` : e.frequency === "monthly" ? `Day ${e.day} of every month${t}` : e.frequency === "weekly" ? `Every ${u[(e.day ?? 1) - 1]}${t}` : `Every day${t}`;
		}
		function fe(e) {
			return e ? new Intl.DateTimeFormat(void 0, {
				dateStyle: "medium",
				timeStyle: "short",
				timeZone: w.value
			}).format(new Date(e)) : "—";
		}
		let pe = {
			ok: "bg-alert-success-bg text-alert-success-text",
			failed: "bg-alert-error-bg text-alert-error-text",
			skipped: "bg-alert-warning-bg text-alert-warning-text"
		};
		return (t, n) => {
			let l = y("BasePageHeader"), f = y("BaseCard"), m = y("BasePage");
			return h(), r(m, null, {
				default: ne(() => [c(l, { title: "AI scheduled tasks" }), c(f, { class: "max-w-3xl" }, {
					default: ne(() => [E.value ? (h(), a("div", Ei, "Loading scheduled tasks…")) : O.value ? (h(), a("div", Di, [o("p", Oi, b(O.value), 1), o("button", {
						type: "button",
						class: "rounded bg-btn-primary px-3 py-2 text-sm text-white",
						onClick: oe
					}, "Try again")])) : (h(), a("div", ki, [
						o("p", Ai, [
							n[9] ||= s("The assistant runs each task’s prompt on its schedule, as the person who created it, so it can read only what that person may read. Each run appears as a new conversation in that person’s AI chat history. Times are in ", -1),
							o("strong", null, b(w.value), 1),
							n[10] ||= s(".", -1)
						]),
						!x.value.length && !j.value ? (h(), a("div", ji, [n[11] ||= o("p", { class: "text-sm text-heading" }, "No scheduled tasks yet.", -1), (h(!0), a(e, null, v(S.value, (e) => (h(), a("div", {
							key: e.key,
							class: "mt-3"
						}, [
							o("p", Mi, b(e.name), 1),
							o("p", Ni, b(e.description), 1),
							o("button", {
								type: "button",
								class: "mt-2 rounded bg-btn-primary px-3 py-2 text-sm text-white hover:bg-btn-primary-hover",
								onClick: (t) => se(e)
							}, "Set this up", 8, Pi)
						]))), 128))])) : i("", !0),
						x.value.length ? (h(), a("ul", Fi, [(h(!0), a(e, null, v(x.value, (e) => (h(), a("li", {
							key: e.id,
							class: "rounded border border-line-default p-4"
						}, [
							o("div", Ii, [o("div", Li, [o("p", Ri, b(e.name), 1), o("p", zi, [s(b(de(e)), 1), e.runs_as_you ? i("", !0) : (h(), a("span", Bi, " · runs as another member"))])]), o("label", Vi, [o("input", {
								type: "checkbox",
								checked: e.enabled,
								disabled: A.value === e.id,
								onChange: (t) => P(e)
							}, null, 40, Hi), s(b(e.enabled ? "On" : "Off"), 1)])]),
							o("dl", Ui, [o("div", null, [n[12] ||= o("dt", { class: "inline" }, "Next run: ", -1), o("dd", Wi, b(e.enabled ? fe(e.next_run_at) : "switched off"), 1)]), o("div", null, [
								n[13] ||= o("dt", { class: "inline" }, "Last run: ", -1),
								o("dd", Gi, b(fe(e.last_run_at)), 1),
								n[14] ||= s(),
								e.last_status ? (h(), a("span", {
									key: 0,
									class: p(["ml-1 rounded px-1.5 py-0.5", pe[e.last_status]])
								}, b(e.last_status), 3)) : i("", !0)
							])]),
							e.last_error ? (h(), a("p", Ki, b(e.last_error), 1)) : i("", !0),
							o("div", qi, [
								o("button", {
									type: "button",
									class: "rounded border border-line-default px-3 py-1.5 text-xs text-body hover:bg-hover disabled:opacity-50",
									disabled: A.value === e.id || !e.enabled,
									onClick: (t) => F(e)
								}, "Run now", 8, Ji),
								o("button", {
									type: "button",
									class: "rounded border border-line-default px-3 py-1.5 text-xs text-body hover:bg-hover",
									onClick: (t) => ce(e)
								}, "Edit", 8, Yi),
								o("button", {
									type: "button",
									class: "rounded border border-line-default px-3 py-1.5 text-xs text-alert-error-text hover:bg-hover disabled:opacity-50",
									disabled: A.value === e.id,
									onClick: (t) => I(e)
								}, "Delete", 8, Xi)
							])
						]))), 128))])) : i("", !0),
						j.value ? i("", !0) : (h(), a("div", Zi, [o("button", {
							type: "button",
							class: "rounded bg-btn-primary px-3 py-2 text-sm text-white hover:bg-btn-primary-hover",
							onClick: n[0] ||= (e) => se()
						}, "New scheduled task"), (h(!0), a(e, null, v(S.value, (e) => D((h(), a("button", {
							key: e.key,
							type: "button",
							class: "rounded border border-line-default px-3 py-2 text-sm text-body hover:bg-hover",
							onClick: (t) => se(e)
						}, "Add “" + b(e.name) + "”", 9, Qi)), [[te, x.value.length]])), 128))])),
						j.value ? (h(), a("form", {
							key: 3,
							class: "space-y-4 border-t border-line-default pt-5",
							onSubmit: re(ue, ["prevent"])
						}, [
							o("h2", $i, b(ae.value === null ? "New scheduled task" : "Edit scheduled task"), 1),
							o("label", ea, [n[15] ||= s("Name ", -1), D(o("input", {
								"onUpdate:modelValue": n[1] ||= (e) => M.name = e,
								maxlength: "120",
								class: "mt-1 w-full rounded-md border border-line-default bg-surface px-3 py-2 text-body"
							}, null, 512), [[T, M.name]])]),
							o("label", ta, [
								n[16] ||= s("What should the assistant do? ", -1),
								D(o("textarea", {
									"onUpdate:modelValue": n[2] ||= (e) => M.prompt = e,
									rows: "12",
									maxlength: "4000",
									class: "mt-1 w-full rounded-md border border-line-default bg-surface px-3 py-2 text-sm text-body"
								}, null, 512), [[T, M.prompt]]),
								o("span", na, "Write it as you would type it to the assistant. It can use the same tools, including the forecast figures. " + b(M.prompt.length) + "/4000", 1)
							]),
							o("div", ra, [
								o("label", ia, [n[17] ||= s("Repeat ", -1), D(o("select", {
									"onUpdate:modelValue": n[3] ||= (e) => M.frequency = e,
									class: "mt-1 w-full rounded-md border border-line-default bg-surface px-3 py-2 text-body",
									onChange: le
								}, [(h(), a(e, null, v(d, (e) => o("option", {
									key: e.value,
									value: e.value
								}, b(e.label), 9, aa)), 64))], 544), [[ee, M.frequency]])]),
								M.frequency === "weekly" ? (h(), a("label", oa, [n[18] ||= s("On ", -1), D(o("select", {
									"onUpdate:modelValue": n[4] ||= (e) => M.day = e,
									class: "mt-1 w-full rounded-md border border-line-default bg-surface px-3 py-2 text-body"
								}, [(h(), a(e, null, v(u, (e, t) => o("option", {
									key: e,
									value: t + 1
								}, b(e), 9, sa)), 64))], 512), [[
									ee,
									M.day,
									void 0,
									{ number: !0 }
								]])])) : M.frequency === "monthly" ? (h(), a("label", ca, [
									n[19] ||= s("Day of the month ", -1),
									D(o("input", {
										"onUpdate:modelValue": n[5] ||= (e) => M.day = e,
										type: "number",
										min: "1",
										max: "31",
										class: "mt-1 w-full rounded-md border border-line-default bg-surface px-3 py-2 text-body"
									}, null, 512), [[
										T,
										M.day,
										void 0,
										{ number: !0 }
									]]),
									n[20] ||= o("span", { class: "mt-1 block text-xs font-normal text-muted" }, "31 means the last day of shorter months.", -1)
								])) : i("", !0),
								o("label", la, [s("At (" + b(w.value) + ") ", 1), D(o("input", {
									"onUpdate:modelValue": n[6] ||= (e) => M.run_at = e,
									type: "time",
									required: "",
									class: "mt-1 w-full rounded-md border border-line-default bg-surface px-3 py-2 text-body"
								}, null, 512), [[T, M.run_at]])])
							]),
							o("label", ua, [D(o("input", {
								"onUpdate:modelValue": n[7] ||= (e) => M.enabled = e,
								type: "checkbox"
							}, null, 512), [[C, M.enabled]]), n[21] ||= s("Switched on", -1)]),
							o("div", da, [o("button", {
								type: "submit",
								class: "rounded bg-btn-primary px-4 py-2 text-sm font-medium text-white hover:bg-btn-primary-hover disabled:opacity-50",
								disabled: ie.value
							}, b(ie.value ? "Saving…" : "Save task"), 9, fa), o("button", {
								type: "button",
								class: "rounded border border-line-default px-4 py-2 text-sm text-body hover:bg-hover",
								onClick: n[8] ||= (e) => j.value = !1
							}, "Cancel")])
						], 32)) : i("", !0)
					]))]),
					_: 1
				})]),
				_: 1
			});
		};
	}
});
//#endregion
//#region resources/js/init.ts
window.InvoiceShelf.booting((e, t, n) => {
	let r = _(!1), i = _(!1), a = _(!1), o = _(!1), s = _(!1), c = _(0), d = (e, t) => {
		n.notify(e, t);
	}, f = async (e = !1) => {
		try {
			let t = e ? k.adminCapabilities : k.capabilities, { data: s } = await n.client.get(t);
			r.value = !!s.chat, i.value = !!s.text_generation, a.value = !!s.can_manage_company, o.value = !!s.can_manage_global;
		} catch {
			r.value = !1, i.value = !1, a.value = !1, o.value = !1;
		}
	};
	n.addMessages({ en: { ai_assistant: {
		title: "AI Assistant",
		chat: {
			new_conversation: "New conversation",
			empty: "No conversations yet.",
			thinking: "Thinking…"
		},
		settings: {
			saved: "AI settings saved.",
			connection_success: "Connection successful."
		}
	} } }), n.on("bootstrap:completed", ({ adminMode: e }) => {
		f(e);
	}), n.on("company:changing", () => {
		s.value = !1, c.value += 1, r.value = !1, i.value = !1;
	}), n.on("company:changed", ({ companyId: e }) => {
		f(e === null);
	}), n.registerHeaderAction({
		id: "ai-assistant.header",
		priority: 20,
		visible: () => r.value,
		component: l({ setup: () => () => u(vr, { onOpen: () => {
			s.value = !0;
		} }) })
	}), n.registerCompanyLayoutOverlay({
		id: "ai-assistant.overlay",
		component: l({ setup: () => () => u(_r, {
			key: c.value,
			open: s.value,
			enabled: r.value,
			client: n.client,
			notify: d,
			"onUpdate:open": (e) => {
				s.value = e;
			}
		}) })
	}), n.registerRichEditorToolbarAction({
		id: "ai-assistant.editor",
		visible: () => i.value,
		component: l({
			props: { context: {
				type: Object,
				required: !0
			} },
			setup: (e) => () => u(Fr, {
				context: e.context,
				enabled: i.value,
				client: n.client,
				notify: d
			})
		})
	}), ma(n, "admin", o, d), ma(n, "company", a, d), n.registerCompanySettingsPage({
		id: "ai-assistant.company-schedules",
		title: "AI scheduled tasks",
		icon: "ClockIcon",
		path: "ai-scheduled-tasks",
		priority: 81,
		visible: () => a.value && r.value,
		component: l({ setup: () => () => u(pa, {
			client: n.client,
			notify: d
		}) })
	});
});
function ma(e, t, n, r) {
	let i = {
		id: `ai-assistant.${t}-settings`,
		title: "AI Assistant",
		icon: "SparklesIcon",
		path: "ai-assistant",
		priority: 80,
		visible: () => n.value,
		component: l({ setup: () => () => u(Ti, {
			client: e.client,
			scope: t,
			notify: r
		}) })
	};
	t === "admin" ? e.registerAdminSettingsPage(i) : e.registerCompanySettingsPage(i);
}
//#endregion
