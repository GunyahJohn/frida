// @ts-nocheck

declare const Il2Cpp: any;
declare const System: any;
declare const XRNode: any;
declare const Random: any;
declare const UnityEngine: any;

let rigidbody = null;
let hue = 0;
let lastRunTime = 0;
const rgbcooldown = 100;

let buttonClickDelay = 0.0;
let menu = null;
let reference = null;
let referenceCollider = null;

let leftPrimary = false;
let leftSecondary = false;
let rightPrimary = false;
let rightSecondary = false;
let leftGrab = false;
let rightGrab = false;
let leftTrigger = false;
let rightTrigger = false;

let deltaTime = 0.0;
let time = 0.0;

let previousNoclipKey = false;
let previousDash = false;
let previousTeleportKey = false;
let shouldbeblack = false;
let ghostlag = false;
let size = 1.0;
let lastTime = 0.0;

let bgColor: [number, number, number, number] = [0.0, 0.0, 0.0, 1.0];
let bgColor2: [number, number, number, number] = [9.0, 9.0, 9.0, 1.0];
let textColor: [number, number, number, number] = [1.0, 1.0, 1.0, 1.0];
let buttonColor: [number, number, number, number] = [0.1, 0.1, 0.1, 1.0];
let buttonPressedColor: [number, number, number, number] = [0.7, 0.7, 0.7, 1.0];

let menuName: string = "Gunyah.lol";

let currentThemeIdx = 0;
let rgbMode = false;
let rgbHue = 0;
let lastRgbReload = 0;

let nameCycling = false;
let nameInterval: any = null;
let nameIndex = 0;
const nameList = ["1010101010101010101010", "99999999999999999", "11111111111111111111"];

const CATEGORY_NAMES = [
  "Home", "Nav", "Settings", "Movement", "Misc", "OP",
  "Rig", "Prefabs", "BigScary", "Colors", "Names", "Fun",
  "UITheme", "Credits"
];

// ================================================================
// UI THEMES
// ================================================================
const THEMES = [
  { name: "Envo Purple",  bg: [0.00, 0.00, 0.00, 1], bg2: [0.06, 0.02, 0.16, 1], text: [0.75, 1.00, 1.00, 1], btn: [0.12, 0.06, 0.28, 1], btnPressed: [0.90, 0.30, 1.00, 1] },
  { name: "J0ker Black",  bg: [0.00, 0.00, 0.00, 1], bg2: [0.05, 0.05, 0.05, 1], text: [1.00, 1.00, 1.00, 1], btn: [0.10, 0.10, 0.10, 1], btnPressed: [0.70, 0.70, 0.70, 1] },
  { name: "Limes Green",  bg: [0.00, 0.00, 0.00, 1], bg2: [0.12, 0.60, 0.28, 1], text: [1.00, 1.00, 1.00, 1], btn: [0.03, 0.22, 0.10, 1], btnPressed: [0.10, 0.42, 0.20, 1] },
  { name: "Blood Red",    bg: [0.00, 0.00, 0.00, 1], bg2: [0.20, 0.02, 0.02, 1], text: [1.00, 0.80, 0.80, 1], btn: [0.15, 0.02, 0.02, 1], btnPressed: [0.90, 0.10, 0.10, 1] },
  { name: "Ice Cyan",     bg: [0.00, 0.00, 0.00, 1], bg2: [0.02, 0.10, 0.15, 1], text: [0.70, 1.00, 1.00, 1], btn: [0.05, 0.18, 0.22, 1], btnPressed: [0.30, 0.90, 1.00, 1] },
  { name: "Matrix",       bg: [0.00, 0.00, 0.00, 1], bg2: [0.00, 0.10, 0.02, 1], text: [0.20, 1.00, 0.30, 1], btn: [0.00, 0.15, 0.03, 1], btnPressed: [0.20, 1.00, 0.30, 1] },
  { name: "Gold",         bg: [0.00, 0.00, 0.00, 1], bg2: [0.15, 0.10, 0.00, 1], text: [1.00, 0.90, 0.50, 1], btn: [0.20, 0.14, 0.02, 1], btnPressed: [1.00, 0.85, 0.30, 1] },
  { name: "Hot Pink",     bg: [0.00, 0.00, 0.00, 1], bg2: [0.20, 0.02, 0.12, 1], text: [1.00, 0.70, 0.95, 1], btn: [0.18, 0.02, 0.10, 1], btnPressed: [1.00, 0.20, 0.70, 1] },
  { name: "Sunset",       bg: [0.00, 0.00, 0.00, 1], bg2: [0.20, 0.08, 0.02, 1], text: [1.00, 0.85, 0.60, 1], btn: [0.18, 0.08, 0.02, 1], btnPressed: [1.00, 0.55, 0.10, 1] },
];

class XRInputHandler {
  private InputDevices: any;
  private tryGetFeatureValue: any;
  private buttonStates: Map<string, boolean>;

  constructor() {
    this.InputDevices = Il2Cpp.domain
      .assembly("UnityEngine.XRModule")
      .image.class("UnityEngine.XR.InputDevices");

    if (!this.InputDevices) throw new Error("InputDevices class not found");

    this.tryGetFeatureValue = this.InputDevices.method("TryGetFeatureValue_bool", 3);
    if (!this.tryGetFeatureValue) throw new Error("TryGetFeatureValue_bool not found");

    this.buttonStates = new Map();
  }

  update() {
    this.updateControllerStates(1);
    this.updateControllerStates(2);
  }

  private updateControllerStates(controllerId: number) {
    const features = ["PrimaryButton", "SecondaryButton", "GripButton", "TriggerButton", "MenuButton"];
    features.forEach(feature => {
      const key = `${controllerId}_${feature}`;
      try { this.buttonStates.set(key, this.getButtonState(controllerId, feature)); }
      catch (_) { this.buttonStates.set(key, false); }
    });
  }

  private getButtonState(deviceId: number, featureName: string): boolean {
    try {
      const valuePtr = Il2Cpp.alloc(1);
      const feature = Il2Cpp.string(featureName);
      const success = this.tryGetFeatureValue.invoke(deviceId, feature, valuePtr);
      if (success) return valuePtr.readU8() !== 0;
    } catch (_) {}
    return false;
  }

  isButtonPressed(controllerId: number, feature: string): boolean {
    return this.buttonStates.get(`${controllerId}_${feature}`) || false;
  }

  get leftControllerPrimaryButton(): boolean    { return this.isButtonPressed(1, "PrimaryButton"); }
  get leftControllerSecondaryButton(): boolean  { return this.isButtonPressed(1, "SecondaryButton"); }
  get rightControllerPrimaryButton(): boolean   { return this.isButtonPressed(2, "PrimaryButton"); }
  get rightControllerSecondaryButton(): boolean { return this.isButtonPressed(2, "SecondaryButton"); }
  get leftGrab(): boolean                       { return this.isButtonPressed(1, "GripButton"); }
  get rightGrab(): boolean                      { return this.isButtonPressed(2, "GripButton"); }
  get leftControllerTriggerButton(): boolean    { return this.isButtonPressed(1, "TriggerButton"); }
  get rightControllerTriggerButton(): boolean   { return this.isButtonPressed(2, "TriggerButton"); }
  get controllerMenuButton(): boolean {
    return this.isButtonPressed(1, "MenuButton") || this.isButtonPressed(2, "MenuButton");
  }
}

Il2Cpp.perform(() => {
  const images = {
    "Assembly-CSharp":                 Il2Cpp.domain.assembly("Assembly-CSharp").image,
    "UnityEngine.CoreModule":          Il2Cpp.domain.assembly("UnityEngine.CoreModule").image,
    "UnityEngine.PhysicsModule":       Il2Cpp.domain.assembly("UnityEngine.PhysicsModule").image,
    "UnityEngine.UIModule":            Il2Cpp.domain.assembly("UnityEngine.UIModule").image,
    "UnityEngine.UI":                  Il2Cpp.domain.assembly("UnityEngine.UI").image,
    "UnityEngine":                     Il2Cpp.domain.assembly("UnityEngine").image,
    "UnityEngine.TextRenderingModule": Il2Cpp.domain.assembly("UnityEngine.TextRenderingModule").image,
    "PhotonUnityNetworking":           Il2Cpp.domain.assembly("PhotonUnityNetworking").image,
  };

  const AssemblyCSharp           = images["Assembly-CSharp"];
  const UnityEngineCore          = images["UnityEngine.CoreModule"];
  const UnityEnginePhysics       = images["UnityEngine.PhysicsModule"];
  const UnityEngineUI            = images["UnityEngine.UI"];
  const UnityEngineUIModule      = images["UnityEngine.UIModule"];
  const UnityEngineTextRendering = images["UnityEngine.TextRenderingModule"];
  const PhotonUnityNetworking    = images["PhotonUnityNetworking"];

  const PhotonVRManager     = AssemblyCSharp.class("Photon.VR.PhotonVRManager");
  const GTPlayerClass       = AssemblyCSharp.class("GorillaLocomotion.Player");
  const GorillaReportButton = AssemblyCSharp.class("RedirectOnTriggerEnter");
  const PhotonNetwork       = PhotonUnityNetworking.class("Photon.Pun.PhotonNetwork");
  const GTPlayer            = GTPlayerClass.method("get_Instance").invoke();

  let PhotonVRPlayerClass = null;
  try { PhotonVRPlayerClass = AssemblyCSharp.class("Photon.VR.Player.PhotonVRPlayer"); } catch (_) {}

  let GunClass = null;
  try { GunClass = AssemblyCSharp.class("Gun"); } catch (_) {}

  let ExtractionEnemyClass = null;
  try { ExtractionEnemyClass = AssemblyCSharp.class("Extraction.ExtractionEnemyComponent"); } catch (_) {}
  if (!ExtractionEnemyClass) try { ExtractionEnemyClass = AssemblyCSharp.class("ExtractionEnemyComponent"); } catch (_) {}

  const GameObject     = UnityEngineCore.class("UnityEngine.GameObject");
  const Object         = UnityEngineCore.class("UnityEngine.Object");
  const Component      = UnityEngineCore.class("UnityEngine.Component");
  const Vector3        = UnityEngineCore.class("UnityEngine.Vector3");
  const Quaternion     = UnityEngineCore.class("UnityEngine.Quaternion");
  const SceneManager   = UnityEngineCore.class("UnityEngine.SceneManagement.SceneManager");
  const Time           = UnityEngineCore.class("UnityEngine.Time");
  const Resources      = UnityEngineCore.class("UnityEngine.Resources");
  const Renderer       = UnityEngineCore.class("UnityEngine.Renderer");
  const Shader         = UnityEngineCore.class("UnityEngine.Shader");
  const RectTransform  = UnityEngineCore.class("UnityEngine.RectTransform");
  const Material       = UnityEngineCore.class("UnityEngine.Material");

  const Collider       = UnityEnginePhysics.class("UnityEngine.Collider");
  const BoxCollider    = UnityEnginePhysics.class("UnityEngine.BoxCollider");
  const Rigidbody      = UnityEnginePhysics.class("UnityEngine.Rigidbody");
  const Physics        = UnityEnginePhysics.class("UnityEngine.Physics");

  const Canvas           = UnityEngineUIModule.class("UnityEngine.Canvas");
  const CanvasScaler     = UnityEngineUI.class("UnityEngine.UI.CanvasScaler");
  const GraphicRaycaster = UnityEngineUI.class("UnityEngine.UI.GraphicRaycaster");
  const Text             = UnityEngineUI.class("UnityEngine.UI.Text");
  const TextMesh         = UnityEngineTextRendering.class("UnityEngine.TextMesh");
  const Font             = UnityEngineTextRendering.class("UnityEngine.Font");

  const GorillaTagger = GTPlayer;

  for (const field of GTPlayerClass.fields) {
    if (field.type.name == "UnityEngine.Rigidbody") {
      rigidbody = GTPlayer.field(field.name).value;
    }
  }

  const MenuShader = Shader.method("Find").invoke(Il2Cpp.string("Unlit/Color"));
  const TextShader = Shader.method("Find").invoke(Il2Cpp.string("GUI/Text Shader"));

  const zeroVector         = Vector3.field("zeroVector").value;
  const oneVector          = Vector3.field("oneVector").value;
  const identityQuaternion = Quaternion.field("identityQuaternion").value;

  const leftHandTransform  = GorillaTagger.field("leftHandTransform").value;
  const rightHandTransform = GorillaTagger.field("rightHandTransform").value;
  const headCollider       = GorillaTagger.field("headCollider").value;

  const Thread = Il2Cpp.corlib.class("System.Threading.Thread");

  const OVRInputHandler = new XRInputHandler();

  const arial = Resources
    .method("GetBuiltinResource", 1)
    .inflate(Font)
    .invoke(Il2Cpp.string("Arial.ttf"));

  function getCamera() {
    try { return GameObject.method("Find").invoke(Il2Cpp.string("MainCamera")); }
    catch (_) { return null; }
  }

  // ---------- helpers ----------
  function Destroy(o: any) { try { Object.method("Destroy", 1).invoke(o); } catch (_) {} }
  function getComponent(obj: any, type: any) {
    try { return obj.method("GetComponent", 1).inflate(type).invoke(); } catch (_) { return null; }
  }
  function addComponent(obj: any, type: any) {
    return obj.method("AddComponent", 1).inflate(type).invoke();
  }
  function getTransform(obj: any) {
    return obj.method("get_transform").invoke();
  }
  function sendOutgoingSafe() {
    try { PhotonNetwork.method("SendAllOutgoingCommands").invoke(); } catch (_) {}
  }

  // ---------- safe vector math (avoids op_Multiply overload roulette) ----------
  function v3get(v: any, axis: string): number {
    return v.field(axis).value;
  }
  function vadd(a: any, b: any): [number, number, number] {
    return [v3get(a,"x")+v3get(b,"x"), v3get(a,"y")+v3get(b,"y"), v3get(a,"z")+v3get(b,"z")];
  }
  function vsub(a: any, b: any): [number, number, number] {
    return [v3get(a,"x")-v3get(b,"x"), v3get(a,"y")-v3get(b,"y"), v3get(a,"z")-v3get(b,"z")];
  }
  function vscale(a: any, s: number): [number, number, number] {
    return [v3get(a,"x")*s, v3get(a,"y")*s, v3get(a,"z")*s];
  }
  function varr(x: number, y: number, z: number): [number, number, number] {
    return [x, y, z];
  }

  function hsl2Rgb(h: number, s: number, l: number) {
    s /= 100; l /= 100;
    const k = (n: number) => (n + h / 30) % 12;
    const a = s * Math.min(l, 1 - l);
    const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
    return [Math.round(255 * f(0)), Math.round(255 * f(8)), Math.round(255 * f(4))];
  }

  function getSmoothColor() {
    hue = (hue + 0.5) % 360;
    const [r, g, b] = hsl2Rgb(hue, 100, 50);
    return { r: r / 255, g: g / 255, b: b / 255, a: 1.0 };
  }

  // ---------- theme functions ----------
  function applyTheme(idx: number) {
    const t = THEMES[idx];
    if (!t) return;
    bgColor = t.bg as any;
    bgColor2 = t.bg2 as any;
    textColor = t.text as any;
    buttonColor = t.btn as any;
    buttonPressedColor = t.btnPressed as any;
    currentThemeIdx = idx;
    rgbMode = false;
  }
  function applyRgbTheme() {
    rgbHue = (rgbHue + 4) % 360;
    const [r, g, b] = hsl2Rgb(rgbHue, 85, 50);
    const rn = r / 255, gn = g / 255, bn = b / 255;
    bgColor = [0, 0, 0, 1];
    bgColor2 = [rn * 0.25, gn * 0.25, bn * 0.25, 1];
    textColor = [1, 1, 1, 1];
    buttonColor = [rn * 0.4, gn * 0.4, bn * 0.4, 1];
    buttonPressedColor = [rn, gn, bn, 1];
  }
  function nextTheme() { applyTheme((currentThemeIdx + 1) % THEMES.length); reloadMenu(); }
  function prevTheme() { applyTheme((currentThemeIdx - 1 + THEMES.length) % THEMES.length); reloadMenu(); }

  // ---------- name cycling ----------
  function cycleName() {
    if (!PhotonNetwork) return;
    const name = nameList[nameIndex % nameList.length];
    try { PhotonNetwork.method("set_NickName").invoke(Il2Cpp.string(name)); } catch (_) {}
    nameIndex++;
  }
  function toggleNameCycling() {
    nameCycling = !nameCycling;
    if (nameCycling) {
      nameIndex = 0;
      cycleName();
      nameInterval = setInterval(cycleName, 2000);
    } else {
      if (nameInterval) { clearInterval(nameInterval); nameInterval = null; }
    }
  }

  let randomNameEnabled = false;
  let lastnamechange = 0;
  function RandomName() {
    if (!randomNameEnabled) return;
    const now = Date.now();
    if (now - lastnamechange >= 800) {
      lastnamechange = now;
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
      let randName = "";
      for (let i = 0; i < 12; i++) randName += chars.charAt(Math.floor(Math.random() * chars.length));
      try { PhotonNetwork.method("set_NickName").invoke(Il2Cpp.string(randName)); } catch (_) {}
    }
  }

  // ---------- UI primitives ----------
  function renderMenuText(
    canvasObject: any,
    text: string = "",
    color: [number, number, number, number] = [1, 1, 1, 1],
    pos = zeroVector,
    sz = oneVector
  ) {
    const title = addComponent(
      createObject(zeroVector, identityQuaternion, oneVector, 3, [0, 0, 0, 0], getTransform(canvasObject)),
      Text
    );
    const bc = getComponent(title, BoxCollider);
    if (bc != null) try { bc.method("set_isTrigger").invoke(true); } catch (_) {}
    title.method("set_text").invoke(Il2Cpp.string(text));
    title.method("set_font").invoke(arial);
    title.method("set_fontSize").invoke(1);
    title.method("set_color").invoke(color);
    title.method("set_fontStyle").invoke(3);
    title.method("set_alignment").invoke(4);
    title.method("set_resizeTextForBestFit").invoke(true);
    title.method("set_resizeTextMinSize").invoke(0);

    const rt = getComponent(title, RectTransform);
    rt.method("set_sizeDelta").invoke(sz);
    rt.method("set_position").invoke(pos);
    rt.method("set_rotation").invoke(
      Quaternion.method("Euler").overload("System.Single","System.Single","System.Single").invoke(180.0, 90.0, 90.0)
    );
  }

  function createObject(
    pos = zeroVector,
    rot = identityQuaternion,
    scale = oneVector,
    primitiveType: number = 3,
    colorArr: [number, number, number, number] = [1, 1, 1, 1],
    parent = null
  ) {
    const obj = GameObject.method("CreatePrimitive").invoke(primitiveType);
    const renderer = getComponent(obj, Renderer);
    if (colorArr[3] == 0) {
      try { renderer.method("set_enabled").invoke(false); } catch (_) {}
    } else {
      // use sharedMaterial so we never clone+leak
      const mat = renderer.method("get_sharedMaterial").invoke();
      mat.method("set_shader").invoke(MenuShader);
      mat.method("set_color").invoke(colorArr);
    }
    const transform = getTransform(obj);
    if (parent != null) transform.method("SetParent", 2).invoke(parent, false);
    transform.method("set_position").invoke(pos);
    transform.method("set_rotation").invoke(rot);
    transform.method("set_localScale").invoke(scale);
    return obj;
  }

  let currentCategory = 0;
  let currentPage = 0;

  interface ButtonInfoConfig {
    buttonText: string;
    method?: () => void;
    enableMethod?: () => void;
    disableMethod?: () => void;
    keepOn?: boolean;
    enabled?: boolean;
  }

  class ButtonInfo {
    buttonText: string;
    method?: () => void;
    enableMethod?: () => void;
    disableMethod?: () => void;
    keepOn: boolean;
    enabled: boolean;

    constructor(config: ButtonInfoConfig) {
      this.buttonText = config.buttonText;
      this.method = config.method;
      this.enableMethod = config.enableMethod;
      this.disableMethod = config.disableMethod;
      this.keepOn = config.keepOn ?? true;
      this.enabled = config.enabled ?? false;
    }
  }

  // ================================================================
  // HAND PAGE INDICATOR
  // ================================================================
  let refText: any = null;
  let refTextObj: any = null;
  let lastIndicatorUpdate = 0;

  function renderReference() {
    try {
      reference = createObject(zeroVector, identityQuaternion, [0.01, 0.01, 0.01], 0, bgColor2, rightHandTransform);
      referenceCollider = getComponent(reference, Collider);
      getTransform(reference).method("set_localPosition").invoke([-0.02, 0.015, 0.13]);
      reference.method("set_layer").invoke(2);
      addComponent(reference, Rigidbody).method("set_isKinematic").invoke(true);

      // page indicator text on the hand
      refTextObj = createObject(zeroVector, identityQuaternion, [1, 1, 1], 0, [0, 0, 0, 0], getTransform(reference));
      refText = addComponent(refTextObj, TextMesh);
      try { refText.method("set_font").invoke(arial); } catch (_) {}
      try { refText.method("set_fontSize").invoke(64); } catch (_) {}
      try { refText.method("set_characterSize").invoke(0.02); } catch (_) {}
      try { refText.method("set_color").invoke([1, 1, 1, 1]); } catch (_) {}
      try { refText.method("set_anchor").invoke(4); } catch (_) {}
      try { refText.method("set_alignment").invoke(1); } catch (_) {}
      getTransform(refTextObj).method("set_localPosition").invoke([0, 0.04, 0]);
      getTransform(refTextObj).method("set_localRotation").invoke(
        Quaternion.method("Euler").overload("System.Single","System.Single","System.Single").invoke(0, 0, 0)
      );
    } catch (e) {
      console.log("[Envo] renderReference failed: " + e);
      reference = null;
      referenceCollider = null;
      refText = null;
      refTextObj = null;
    }
  }

  function updateIndicator() {
    if (refText == null) return;
    try {
      const cat = CATEGORY_NAMES[currentCategory] || "?";
      const total = Math.max(1, Math.ceil(buttons[currentCategory].length / 6));
      refText.method("set_text").invoke(Il2Cpp.string(`${cat} ${currentPage + 1}/${total}`));
    } catch (_) {}
  }

  // ================================================================
  // MENU RENDER
  // ================================================================
  function renderMenu() {
    try {
      menu = createObject(zeroVector, identityQuaternion, [0.1, 0.3, 0.3825], 3, [0, 0, 0, 0]);
      Destroy(getComponent(menu, BoxCollider));

      const bg = createObject([0.1, 0, 0], identityQuaternion, [0.1, 0.86, 0.7], 3, bgColor, getTransform(menu));
      Destroy(getComponent(bg, BoxCollider));

      const bg2 = createObject([0.1, 0, 0], identityQuaternion, [0.09, 0.88, 0.72], 3, bgColor2, getTransform(menu));
      Destroy(getComponent(bg2, BoxCollider));

      const canvasObject = createObject(zeroVector, identityQuaternion, oneVector, 3, [0, 0, 0, 0], getTransform(menu));
      const canvas = addComponent(canvasObject, Canvas);
      Destroy(getComponent(canvasObject, BoxCollider));

      const canvasScaler = addComponent(canvasObject, CanvasScaler);
      addComponent(canvasObject, GraphicRaycaster);
      canvas.method("set_renderMode").invoke(2);
      canvasScaler.method("set_dynamicPixelsPerUnit").invoke(1000.0);

      // Home chip
      const homeButton = createObject([0.1, -0.06, 0.205], identityQuaternion, [0.09, 0.2682, 0.075], 3, buttonColor, getTransform(menu));
      createObject([0.1, -0.06, 0.205], identityQuaternion, [0.08, 0.3, 0.1], 3, bgColor2, getTransform(menu));
      homeButton.method("set_name").invoke(Il2Cpp.string("@Home"));
      addComponent(homeButton, GorillaReportButton);
      const hbC = getComponent(homeButton, BoxCollider);
      if (hbC) try { hbC.method("set_isTrigger").invoke(true); } catch (_) {}
      renderMenuText(canvasObject, "Home", textColor, [0.105, -0.06, 0.205], [0.15, 0.15]);

      // Leave chip
      const leaveButton = createObject([0.1, 0.06, 0.205], identityQuaternion, [0.09, 0.2682, 0.075], 3, buttonColor, getTransform(menu));
      createObject([0.1, 0.06, 0.205], identityQuaternion, [0.08, 0.3, 0.1], 3, bgColor2, getTransform(menu));
      leaveButton.method("set_name").invoke(Il2Cpp.string("@Leave"));
      addComponent(leaveButton, GorillaReportButton);
      const lbC = getComponent(leaveButton, BoxCollider);
      if (lbC) try { lbC.method("set_isTrigger").invoke(true); } catch (_) {}
      renderMenuText(canvasObject, "Leave", textColor, [0.105, 0.06, 0.205], [0.15, 0.15]);

      const total = Math.max(1, Math.ceil(buttons[currentCategory].length / 6));
      renderMenuText(canvasObject,
        menuName + ` - ${CATEGORY_NAMES[currentCategory] || ""} [ <color=cyan>${currentPage + 1}/${total}</color>]`,
        textColor, [0.11, 0, 0.155], [1, 0.1]);

      // prev
      {
        const b = createObject([0.1, 0.17, 0], identityQuaternion, [0.09, 0.15, 0.58], 3, buttonColor, getTransform(menu));
        createObject([0.1, 0.17, 0], identityQuaternion, [0.08, 0.16, 0.59], 3, bgColor2, getTransform(menu));
        b.method("set_name").invoke(Il2Cpp.string("@PreviousPage"));
        addComponent(b, GorillaReportButton);
        const c = getComponent(b, BoxCollider);
        if (c) try { c.method("set_isTrigger").invoke(true); } catch (_) {}
        renderMenuText(canvasObject, "←", textColor, [0.11, 0.17, 0], [1, 0.1]);
      }
      // next
      {
        const b = createObject([0.1, -0.17, 0], identityQuaternion, [0.09, 0.15, 0.58], 3, buttonColor, getTransform(menu));
        createObject([0.1, -0.17, 0], identityQuaternion, [0.08, 0.16, 0.59], 3, bgColor2, getTransform(menu));
        b.method("set_name").invoke(Il2Cpp.string("@NextPage"));
        addComponent(b, GorillaReportButton);
        const c = getComponent(b, BoxCollider);
        if (c) try { c.method("set_isTrigger").invoke(true); } catch (_) {}
        renderMenuText(canvasObject, "→", textColor, [0.11, -0.17, 0], [1, 0.1]);
      }

      let i = 0;
      const targetMods = buttons[currentCategory].slice(currentPage * 6).slice(0, 6);
      targetMods.forEach((buttonData) => {
        const button = createObject([0.105, 0, 0.11 - (i * 0.04)], identityQuaternion, [0.09, 0.8, 0.08], 3, buttonColor, getTransform(menu));
        button.method("set_name").invoke(Il2Cpp.string("@" + buttonData.buttonText));
        addComponent(button, GorillaReportButton);
        const c = getComponent(button, BoxCollider);
        if (c) try { c.method("set_isTrigger").invoke(true); } catch (_) {}
        renderMenuText(canvasObject, buttonData.buttonText, textColor, [0.11, 0, 0.11 - (i * 0.04)], [1, 0.1]);
        updateButtonColor(button, buttonData);
        i++;
      });

      recenterMenu();
      updateIndicator();
    } catch (e) {
      console.log("[Envo] renderMenu failed: " + e);
      try { if (menu != null && !menu.isNull()) Destroy(menu); } catch (_) {}
      menu = null;
    }
  }

  function recenterMenu() {
    if (menu == null) return;
    try {
      if (menu.isNull()) { menu = null; return; }
      const mt = getTransform(menu);
      if (mt == null || mt.isNull()) { menu = null; return; }
      if (leftHandTransform == null || leftHandTransform.isNull()) return;

      const pos = leftHandTransform.method("get_position").invoke();
      const rot = leftHandTransform.method("get_rotation").invoke();
      const offset = Quaternion.method("Euler").overload("System.Single","System.Single","System.Single").invoke(-45.0, 0.0, 0.0);
      const combined = Quaternion.method("op_Multiply")
        .overload("UnityEngine.Quaternion", "UnityEngine.Quaternion")
        .invoke(rot, offset);

      mt.method("set_position").invoke(pos);
      mt.method("set_rotation").invoke(combined);
    } catch (_) {
      menu = null;
    }
  }

  function reloadMenu() {
    if (menu != null) {
      try { if (!menu.isNull()) Object.method("Destroy", 1).invoke(menu); } catch (_) {}
      menu = null;
    }
  }

  // shared-material retint — no clones, no leaks
  function updateButtonColor(button: any, buttonData: ButtonInfo) {
    try {
      const r = getComponent(button, Renderer);
      if (!r) return;
      const mat = r.method("get_sharedMaterial").invoke();
      const c = buttonData.enabled ? buttonPressedColor : buttonColor;
      mat.method("set_color").invoke([c[0], c[1], c[2], c[3]]);
    } catch (_) {}
  }

  // ================================================================
  // GUN TICK — replaces the dead Gun.Update hook
  // ================================================================
  let infiniteAmmoEnabled = false;
  let rapidFireEnabled = false;
  let noRecoilEnabled = false;
  let instantReloadEnabled = false;

  function GunTick() {
    if (!GunClass) return;
    if (!infiniteAmmoEnabled && !rapidFireEnabled && !noRecoilEnabled && !instantReloadEnabled) return;
    try {
      const guns = Object.method("FindObjectsOfType").inflate(GunClass).invoke();
      if (guns == null || guns.isNull()) return;
      const len = guns.length;
      for (let i = 0; i < len; i++) {
        const g = guns.get(i);
        if (g == null || g.isNull()) continue;
        try {
          const pv = g.field("photonView").value;
          if (pv == null || pv.isNull()) continue;
          if (!pv.method("get_IsMine").invoke()) continue;
        } catch (_) { continue; }

        if (infiniteAmmoEnabled) {
          try {
            const maxAmmo = g.field("HGBGIMIPALP").value;
            g.field("DHPHHKDPLPL").value = (maxAmmo > 0) ? maxAmmo : 999;
          } catch (_) {
            try { g.field("DHPHHKDPLPL").value = 999; } catch (_) {}
          }
        }
        if (rapidFireEnabled) {
          try { g.field("isAutomatic").value = true; } catch (_) {}
          try { g.field("DNFGAFACGNB").value = 0.0; } catch (_) {}
        }
        if (noRecoilEnabled) {
          try { g.field("_vibrationAmplitude").value = 0.0; } catch (_) {}
          try { g.field("_vibrationDuration").value  = 0.0; } catch (_) {}
        }
        if (instantReloadEnabled) {
          try { g.field("KEEJKFBAPJP").value = 0.0; } catch (_) {}
          try { g.field("PJIMBENKIGI").value = false; } catch (_) {}
        }
      }
    } catch (_) {}
  }

  // ================================================================
  // GUN POINTER
  // ================================================================
  let gunLocked = false;
  let lockTarget = null;
  let GunPointer = null;

  function renderGun(overrideLayerMask = null) {
    const StartPosition = rightHandTransform.method("get_position").invoke();
    const Direction = rightHandTransform.method("get_forward").invoke();
    const DirectionDivided = vscale(Direction, 1 / 4);
    const rayStartPosition = vadd(StartPosition, { field: (k) => ({ value: DirectionDivided[k == "x" ? 0 : k == "y" ? 1 : 2] }) } as any);
    const layerMask = overrideLayerMask ?? -1;

    let finalRay = null;
    let finalDistance = Infinity;
    try {
      const hits = Physics.method("RaycastAll", 4).invoke(varr(rayStartPosition[0], rayStartPosition[1], rayStartPosition[2]), Direction, 512.0, layerMask);
      for (const hit of hits) {
        const distance = Vector3.method("Distance").invoke(hit.method("get_point").invoke(), StartPosition);
        if (distance < finalDistance) { finalRay = hit; finalDistance = distance; }
      }
    } catch (_) {}

    let EndPosition;
    if (gunLocked && lockTarget != null) {
      EndPosition = getTransform(lockTarget).method("get_position").invoke();
    } else if (finalRay != null) {
      EndPosition = finalRay.method("get_point").invoke();
    } else {
      EndPosition = vadd(StartPosition, vscale(Direction, 512));
    }

    if (GunPointer == null) {
      GunPointer = createObject(EndPosition, identityQuaternion, [0.1, 0.1, 0.1], 0, [1, 1, 1, 1]);
    }
    GunPointer.method("SetActive").invoke(true);
    getTransform(GunPointer).method("set_position").invoke(EndPosition);

    const pr = getComponent(GunPointer, Renderer);
    if (pr) {
      const mat = pr.method("get_sharedMaterial").invoke();
      mat.method("set_shader").invoke(TextShader);
      const c = (gunLocked || rightTrigger) ? buttonPressedColor : buttonColor;
      mat.method("set_color").invoke([c[0], c[1], c[2], c[3]]);
    }

    const col = getComponent(GunPointer, Collider);
    if (col != null) Destroy(col);

    return { ray: finalRay, gunPointer: GunPointer };
  }

  // ================================================================
  // MOVEMENT
  // ================================================================
  let flyspeed = 5.0;
  let ghost = false;
  let spawnedRig = null;

  function Fly() {
    if (!rightSecondary) return;
    try {
      rigidbody.method("set_velocity").invoke(zeroVector);
      const t = getTransform(GorillaTagger);
      const fwd = rightHandTransform.method("get_forward").invoke();
      const pos = t.method("get_position").invoke();
      const step = vscale(fwd, flyspeed * deltaTime);
      t.method("set_position").invoke(vadd(pos, step));
    } catch (_) {}
  }

  function Velofly() {
    if (!rightSecondary) return;
    try {
      const fwd = rightHandTransform.method("get_forward").invoke();
      const f = vscale(fwd, flyspeed * 7.0 * deltaTime);
      rigidbody.method("AddForce", 2).invoke(f, 2);
    } catch (_) {}
  }

  function headfly() {
    if (!rightSecondary || !rigidbody) return;
    try {
      rigidbody.method("set_velocity").invoke(zeroVector);
      const t = getTransform(GorillaTagger);
      const cam = getCamera();
      if (cam == null || cam.isNull()) return;
      const fwd = getTransform(cam).method("get_forward").invoke();
      const pos = t.method("get_position").invoke();
      const step = vscale(fwd, flyspeed * deltaTime);
      t.method("set_position").invoke(vadd(pos, step));
    } catch (_) {}
  }

  function MoonWalk() {
    if (!rightSecondary) return;
    try {
      const fwd = rightHandTransform.method("get_forward").invoke();
      const move = vscale(fwd, -flyspeed * deltaTime);
      const t = getTransform(GorillaTagger);
      const pos = t.method("get_position").invoke();
      t.method("set_position").invoke(vadd(pos, move));
    } catch (_) {}
  }

  function Platforms() {
    try {
      if (leftGrab) {
        if (platL == null) {
          const h = leftHandTransform;
          const pos = vadd(h.method("get_position").invoke(), { field: (k) => ({ value: k == "x" ? 0.01 : k == "y" ? -0.035 : 0.0 }) } as any);
          platL = createObject(varr(pos[0], pos[1], pos[2]), h.method("get_rotation").invoke(), [0.025, 0.25, 0.3], 3, platColor);
        }
      } else if (platL != null) { Destroy(platL); platL = null; }

      if (rightGrab) {
        if (platR == null) {
          const h = rightHandTransform;
          const pos = vadd(h.method("get_position").invoke(), { field: (k) => ({ value: k == "x" ? 0.0 : k == "y" ? -0.035 : 0.0 }) } as any);
          platR = createObject(varr(pos[0], pos[1], pos[2]), h.method("get_rotation").invoke(), [0.025, 0.25, 0.3], 3, platColor);
        }
      } else if (platR != null) { Destroy(platR); platR = null; }
    } catch (_) {}
  }

  function Platformssphere() {
    try {
      if (leftGrab) {
        if (platL == null) {
          const h = leftHandTransform;
          const pos = vadd(h.method("get_position").invoke(), { field: (k) => ({ value: k == "x" ? 0.0 : k == "y" ? -0.035 : 0.0 }) } as any);
          platL = createObject(varr(pos[0], pos[1], pos[2]), h.method("get_rotation").invoke(), [0.12, 0.12, 0.12], 0, platColor);
        }
      } else if (platL != null) { Destroy(platL); platL = null; }

      if (rightGrab) {
        if (platR == null) {
          const h = rightHandTransform;
          const pos = vadd(h.method("get_position").invoke(), { field: (k) => ({ value: k == "x" ? 0.0 : k == "y" ? -0.035 : 0.0 }) } as any);
          platR = createObject(varr(pos[0], pos[1], pos[2]), h.method("get_rotation").invoke(), [0.12, 0.12, 0.12], 0, platColor);
        }
      } else if (platR != null) { Destroy(platR); platR = null; }
    } catch (_) {}
  }

  function UpAndDown() {
    try {
      if (rightTrigger) rigidbody.method("set_velocity").invoke([0.0, 12.0, 0.0]);
      else if (rightGrab) rigidbody.method("set_velocity").invoke([0.0, -12.0, 0.0]);
    } catch (_) {}
  }

  function scalearms() {
    try {
      getTransform(GorillaTagger).method("set_localScale").invoke([size, size, size]);
      if (rightTrigger) size = size < 4.5 ? size + 0.1 : 4.5;
      if (leftTrigger)  size = size > 0.2 ? size - 0.1 : 0.2;
    } catch (_) {}
  }

  function spinbot() {
    try {
      const cam = getCamera();
      if (!cam || cam.isNull()) return;
      getTransform(cam).method("set_rotation").invoke(
        Quaternion.method("Euler").overload("System.Single","System.Single","System.Single").invoke(0.0, time * 800.0, 0.0)
      );
    } catch (_) {}
  }

  function Noclip() {
    if (rightTrigger && !previousNoclipKey) toggleColliders(false);
    if (!rightTrigger && previousNoclipKey) toggleColliders(true);
    previousNoclipKey = rightTrigger;
  }
  function toggleColliders(enabled: boolean) {
    try {
      const cols = Object.method("FindObjectsOfType").inflate(Collider).invoke();
      for (let i = 0; i < cols.length; i++) cols.get(i).method("set_enabled").invoke(enabled);
    } catch (_) {}
  }

  // ---------- expanded movement ----------
  let bunnyHopEnabled = false;
  let rocketJumpCooldown = 0;
  let speedCycleEnabled = false;
  let lastSpeedCycle = 0;
  let speedCyclePhase = 0;
  let zeroGravEnabled = false;
  let tpFwdCooldown = 0;
  let jumpSpamEnabled = false;
  let lastJumpSpam = 0;
  let wallClimbEnabled = false;
  let slideEnabled = false;
  let freezeEnabled = false;
  let launchCooldown = 0;
  let speedBoostEnabled = false;
  let speedBoostMult = 4.0;
  let lastHandTP = 0;

  function BunnyHop() {
    if (!bunnyHopEnabled) return;
    try {
      const vel = rigidbody.method("get_velocity").invoke();
      if (vel.field("y").value < 0.5) {
        vel.field("y").value = 6.5;
        rigidbody.method("set_velocity").invoke(vel);
      }
    } catch (_) {}
  }

  function RocketJump() {
    if (!rightPrimary || !leftPrimary) return;
    const now = Date.now();
    if (now - rocketJumpCooldown < 400) return;
    rocketJumpCooldown = now;
    try {
      const cam = getCamera();
      if (!cam || cam.isNull()) return;
      const dir = getTransform(cam).method("get_forward").invoke();
      const boost = vscale(dir, -22);
      rigidbody.method("set_velocity").invoke(boost);
    } catch (_) {}
  }

  function SpeedCycle() {
    if (!speedCycleEnabled) return;
    const now = Date.now();
    if (now - lastSpeedCycle < 80) return;
    lastSpeedCycle = now;
    speedCyclePhase = (speedCyclePhase + 1) % 3;
    try {
      let mult = 1.0;
      if (speedCyclePhase === 1) mult = 8.0;
      else if (speedCyclePhase === 2) mult = 20.0;
      const vel = rigidbody.method("get_velocity").invoke();
      vel.field("x").value = vel.field("x").value * mult;
      vel.field("z").value = vel.field("z").value * mult;
      rigidbody.method("set_velocity").invoke(vel);
    } catch (_) {}
  }

  function ZeroGrav() {
    if (!zeroGravEnabled) return;
    try {
      const vel = rigidbody.method("get_velocity").invoke();
      vel.field("y").value = vel.field("y").value + (9.81 * deltaTime);
      rigidbody.method("set_velocity").invoke(vel);
    } catch (_) {}
  }

  function TeleportForward() {
    const now = Date.now();
    if (now - tpFwdCooldown < 300) return;
    tpFwdCooldown = now;
    try {
      const cam = getCamera();
      if (!cam || cam.isNull()) return;
      const dir = getTransform(cam).method("get_forward").invoke();
      const step = vscale(dir, 4.0);
      const t = getTransform(GorillaTagger);
      const pos = t.method("get_position").invoke();
      t.method("set_position").invoke(vadd(pos, step));
    } catch (_) {}
  }

  function TeleportUp() {
    try {
      const t = getTransform(GorillaTagger);
      const pos = t.method("get_position").invoke();
      t.method("set_position").invoke(vadd(pos, varr(0, 3, 0)));
    } catch (_) {}
  }

  function TeleportToHand() {
    const now = Date.now();
    if (now - lastHandTP < 300) return;
    lastHandTP = now;
    try {
      const t = getTransform(GorillaTagger);
      const handPos = rightHandTransform.method("get_position").invoke();
      t.method("set_position").invoke(handPos);
    } catch (_) {}
  }

  function SpinBody() {
    try {
      const t = getTransform(GorillaTagger);
      const rot = t.method("get_rotation").invoke();
      const spin = Quaternion.method("Euler").overload("System.Single","System.Single","System.Single").invoke(0, deltaTime * 720, 0);
      const newRot = Quaternion.method("op_Multiply")
        .overload("UnityEngine.Quaternion", "UnityEngine.Quaternion")
        .invoke(rot, spin);
      t.method("set_rotation").invoke(newRot);
    } catch (_) {}
  }

  function JumpSpam() {
    if (!jumpSpamEnabled) return;
    const now = Date.now();
    if (now - lastJumpSpam < 120) return;
    lastJumpSpam = now;
    try {
      const vel = rigidbody.method("get_velocity").invoke();
      vel.field("y").value = 8.0;
      rigidbody.method("set_velocity").invoke(vel);
    } catch (_) {}
  }

  function HighJump() {
    try {
      const vel = rigidbody.method("get_velocity").invoke();
      vel.field("y").value = 22.0;
      rigidbody.method("set_velocity").invoke(vel);
    } catch (_) {}
  }

  function WallClimb() {
    if (!wallClimbEnabled) return;
    if (!rightGrab && !leftGrab) return;
    try {
      const cam = getCamera();
      if (!cam || cam.isNull()) return;
      const fwd = getTransform(cam).method("get_forward").invoke();
      const up = varr(0, 1, 0);
      const climb = vscale(fwd, 8);
      const lift = vscale(up, 4);
      const combined = vadd(climb, lift);
      rigidbody.method("set_velocity").invoke(combined);
    } catch (_) {}
  }

  function Slide() {
    if (!slideEnabled) return;
    try {
      const t = getTransform(GorillaTagger);
      const fwd = t.method("get_forward").invoke();
      const vel = rigidbody.method("get_velocity").invoke();
      const boost = vscale(fwd, 14.0);
      vel.field("x").value = boost[0];
      vel.field("y").value = vel.field("y").value;
      vel.field("z").value = boost[2];
      rigidbody.method("set_velocity").invoke(vel);
    } catch (_) {}
  }

  function FreezeInPlace() {
    if (!freezeEnabled) return;
    try { rigidbody.method("set_velocity").invoke(zeroVector); } catch (_) {}
  }

  function LaunchUp() {
    const now = Date.now();
    if (now - launchCooldown < 500) return;
    launchCooldown = now;
    try {
      const vel = rigidbody.method("get_velocity").invoke();
      vel.field("y").value = 45.0;
      rigidbody.method("set_velocity").invoke(vel);
    } catch (_) {}
  }

  function LaunchForward() {
    const now = Date.now();
    if (now - launchCooldown < 500) return;
    launchCooldown = now;
    try {
      const cam = getCamera();
      if (!cam || cam.isNull()) return;
      const dir = getTransform(cam).method("get_forward").invoke();
      const boost = vscale(dir, 40);
      const vel = rigidbody.method("get_velocity").invoke();
      vel.field("x").value = boost[0];
      vel.field("z").value = boost[2];
      rigidbody.method("set_velocity").invoke(vel);
    } catch (_) {}
  }

  function SpeedBoost() {
    if (!speedBoostEnabled) return;
    try {
      const vel = rigidbody.method("get_velocity").invoke();
      vel.field("x").value = vel.field("x").value * speedBoostMult;
      vel.field("z").value = vel.field("z").value * speedBoostMult;
      rigidbody.method("set_velocity").invoke(vel);
    } catch (_) {}
  }

  // ---------- rig / ghost ----------
  function GhostRig() {
    if (!rightSecondary) return;
    const now = Date.now();
    if (now - lastRunTime >= 500) {
      lastRunTime = now;
      ghost = !ghost;
      try {
        const mgr = PhotonVRManager.method("get_Manager").invoke();
        const lp = mgr.field("LocalPlayer").value;
        if (lp != null && !lp.isNull()) lp.method("set_enabled").invoke(!ghost);
      } catch (_) {}
    }
  }

  function InvisRig() {
    if (!rightSecondary) return;
    const now = Date.now();
    if (now - lastRunTime < 500) return;
    lastRunTime = now;
    try {
      const mgr = PhotonVRManager.method("get_Manager").invoke();
      if (mgr == null || mgr.isNull()) return;
      const lp = mgr.field("LocalPlayer").value;
      let inv = false;
      if (lp == null || lp.isNull()) inv = true;
      else { try { inv = !(lp.method("get_enabled").invoke() as boolean); } catch (_) {} }

      if (!inv) {
        try {
          PhotonNetwork.method("DestroyPlayerObjects").invoke(PhotonNetwork.method("get_LocalPlayer").invoke());
          sendOutgoingSafe();
        } catch (_) {}
        spawnedRig = null;
      } else {
        try {
          const mgr2 = PhotonVRManager.method("get_Manager").invoke();
          const lp2 = mgr2.field("LocalPlayer").value;
          if (lp2 != null && !lp2.isNull()) lp2.method("set_enabled").invoke(true);
          else {
            spawnedRig = PhotonNetwork.method("Instantiate", 5).invoke(
              Il2Cpp.string("photonvr/OnlinePlayerRig"),
              getTransform(headCollider).method("get_position").invoke(),
              identityQuaternion, 0, NULL
            );
            sendOutgoingSafe();
          }
        } catch (_) {}
      }
    } catch (_) {}
  }

  function ForceRecoverRig() {
    try {
      const mgr = PhotonVRManager.method("get_Manager").invoke();
      if (mgr != null && !mgr.isNull()) {
        const lp = mgr.field("LocalPlayer").value;
        if (lp != null && !lp.isNull()) { lp.method("set_enabled").invoke(true); return; }
      }
    } catch (_) {}
    try {
      spawnedRig = PhotonNetwork.method("Instantiate", 5).invoke(
        Il2Cpp.string("photonvr/OnlinePlayerRig"),
        getTransform(headCollider).method("get_position").invoke(),
        identityQuaternion, 0, NULL
      );
      sendOutgoingSafe();
    } catch (_) {}
  }

  // ---------- platforms colours ----------
  let platColor: [number, number, number, number] = [0.0, 0.0, 0.0, 1.0];
  const platColors: [number, number, number, number][] = [
    [0.0, 0.0, 0.0, 1.0], [9.0, 9.0, 9.0, 1.0], [9.0, 0.0, 0.0, 1.0],
    [0.0, 9.0, 0.0, 1.0], [0.0, 0.0, 9.0, 1.0], [5.0, 5.0, 0.0, 1.0], [9.0, 0.5, 9.0, 1.0],
  ];
  let platL = null;
  let platR = null;
  let plater = 0;

  // ================================================================
  // MISC / OP / FUN
  // ================================================================
  function OpenStaff() {
    try {
      const all = Object.method("FindObjectsOfType").inflate(BoxCollider).invoke();
      for (let i = 0; i < all.length; i++) {
        const c = all.get(i);
        try {
          if (c.method("get_name").invoke().toString().includes("Cube"))
            c.method("set_enabled").invoke(false);
        } catch (_) {}
      }
    } catch (_) {}
    const kill = [
      "miroorcolideryeee", "hahahahahhahahhaheheheh", "AFJHDSUFHSDIUHHDSIUFHSIDOOR", "thingcol",
      "Cube (5)", "Plane", "Cube (9)", "Plane (1)", "Cube (3)", "Cube (4)", "Cube (6)",
      "Plane (2)", "Plane (3)", "Cube (7)", "Plane (5)", "Cube (12)", "Plane (4)", "Cube (10)",
      "Plane (6)", "Plane (7)", "Plane (9)", "Plane (8)", "Plane (10)", "Cube (11)", "Plane (11)",
      "Cube (8)", "Plane (12)", "Plane (13)", "Plane (14)", "Plane (15)", "Plane (16)",
      "Plane (17)", "Plane (18)", "Plane (19)", "Plane (20)", "Cube (13)"
    ];
    for (let i = 0; i < kill.length; i++) {
      try { Destroy(GameObject.method("Find").invoke(Il2Cpp.string(kill[i]))); } catch (_) {}
    }
  }

  function logAll() {
    try {
      const others = PhotonNetwork.method("get_PlayerListOthers").invoke();
      if (others && others.length > 0) {
        for (let i = 0; i < others.length; i++) {
          console.log("Nick: " + others.get(i).method("get_NickName").invoke().toString());
        }
      }
    } catch (_) {}
  }

  function spoofID() {
    try {
      const lp = PhotonNetwork.method("get_LocalPlayer").invoke();
      if (!lp) return;
      lp.method("set_UserId").invoke(Il2Cpp.string("Envo_" + Math.floor(1000 + Math.random() * 9000)));
    } catch (_) {}
  }

  function getinfogun() {
    if (!rightGrab) return;
    const gD = renderGun();
    const r = gD.ray;
    if (rightTrigger && r != null) {
      try {
        const hO = r.method("get_collider").invoke().method("get_gameObject").invoke();
        console.log("[Info] " + hO.method("get_name").invoke().toString());
      } catch (_) {}
    }
  }

  function RigSpam() {
    if (!rightGrab) return;
    const now = Date.now();
    if (now - lastRunTime < 100) return;
    lastRunTime = now;
    try {
      const rig = PhotonNetwork.method("Instantiate", 5).invoke(
        Il2Cpp.string("photonvr/OnlinePlayerRig"),
        getTransform(headCollider).method("get_position").invoke(),
        identityQuaternion, 0, NULL
      );
      if (rig == null || rig.isNull()) return;
      const comps = rig.method("GetComponents", 1).inflate(Component).invoke();
      if (comps == null || comps.isNull()) return;
      for (let i = 0; i < comps.length; i++) {
        try {
          const c = comps.get(i);
          if (c == null || c.isNull()) continue;
          const name = c.method("GetType", 0).invoke().method("get_Name").invoke().toString();
          if (name.includes("PhotonVRPlayer")) setTimeout(() => Destroy(c), 500);
        } catch (_) {}
      }
    } catch (_) {}
    sendOutgoingSafe();
  }

  function RigGun() {
    if (!rightGrab) return;
    const gd = renderGun();
    if (rightTrigger) {
      try {
        const pos = getTransform(gd.gunPointer).method("get_position").invoke();
        PhotonNetwork.method("Instantiate", 5).invoke(Il2Cpp.string("photonvr/OnlinePlayerRig"), pos, identityQuaternion, 0, NULL);
        sendOutgoingSafe();
      } catch (_) {}
    }
  }

  function PrefabGun(spawnId: string) {
    if (!rightGrab) return;
    const gd = renderGun();
    if (rightTrigger) {
      try {
        const pos = getTransform(gd.gunPointer).method("get_position").invoke();
        PhotonNetwork.method("Instantiate", 5).invoke(Il2Cpp.string(spawnId), pos, identityQuaternion, 0, NULL);
        sendOutgoingSafe();
      } catch (_) {}
    }
  }

  function ObjGun(OBJ: string) {
    if (!rightGrab) return;
    const gd = renderGun();
    if (rightTrigger) {
      try {
        const obj = GameObject.method("Find").invoke(Il2Cpp.string(OBJ));
        if (obj == null || obj.isNull()) return;
        const pos = getTransform(gd.gunPointer).method("get_position").invoke();
        getTransform(obj).method("set_position").invoke(pos);
      } catch (_) {}
    }
  }

  function LagAll() {
    for (let i = 0; i < 1500; i++) {
      try {
        const o = PhotonNetwork.method("Instantiate", 5).invoke(Il2Cpp.string("spaceship"), [400.0, -400.0, 0.0], identityQuaternion, 0, NULL);
        Destroy(o);
      } catch (_) {}
    }
    sendOutgoingSafe();
  }

  function DestroyAll() {
    try {
      const others = PhotonNetwork.method("get_PlayerListOthers").invoke();
      if (others && others.length > 0) {
        for (let i = 0; i < others.length; i++) {
          PhotonNetwork.method("SetMasterClient").invoke(PhotonNetwork.method("get_LocalPlayer").invoke());
          PhotonNetwork.method("DestroyPlayerObjects").invoke(others.get(i));
        }
      }
    } catch (_) {}
  }

  function nameAll() {
    try {
      const others = PhotonNetwork.method("get_PlayerListOthers").invoke();
      if (others && others.length > 0) {
        for (let i = 0; i < others.length; i++) {
          PhotonNetwork.method("SetMasterClient").invoke(PhotonNetwork.method("get_LocalPlayer").invoke());
          others.get(i).method("set_NickName").invoke(Il2Cpp.string("Envo"));
        }
      }
    } catch (_) {}
  }

  function fakelag() {
    const now = Date.now();
    if (now - lastRunTime < 170) return;
    lastRunTime = now;
    ghostlag = !ghostlag;
    try {
      const mgr = PhotonVRManager.method("get_Manager").invoke();
      const lp = mgr.field("LocalPlayer").value;
      if (lp != null && !lp.isNull()) lp.method("set_enabled").invoke(!ghostlag);
    } catch (_) {}
  }

  let lastStrobe = 0;
  function strobe() {
    const now = Date.now();
    if (now - lastStrobe < 100) return;
    lastStrobe = now;
    shouldbeblack = !shouldbeblack;
    try {
      if (shouldbeblack) PhotonVRManager.method("SetColour").invoke([0, 0, 0, 1]);
      else PhotonVRManager.method("SetColour").invoke([1, 1, 1, 1]);
    } catch (_) {}
  }

  function strobename() {
    const now = Date.now();
    if (now - lastStrobe < 100) return;
    lastStrobe = now;
    shouldbeblack = !shouldbeblack;
    try {
      if (shouldbeblack) PhotonNetwork.method("set_NickName").invoke(Il2Cpp.string("          "));
      else PhotonNetwork.method("set_NickName").invoke(Il2Cpp.string("WWWWWWWWWW"));
    } catch (_) {}
  }

  function brightwhite() {
    try { PhotonVRManager.method("SetColour").invoke([9999, 9999, 9999, 9999]); } catch (_) {}
  }

  // ---------- cosmetics ----------

  let cosmeticsUnlocked = false;
  function UnlockAllCosmetics() {
    if (cosmeticsUnlocked) return;
    try {
      let C = null;
      try { C = AssemblyCSharp.class("CosmeticSO"); } catch (_) {}
      if (!C) try { C = AssemblyCSharp.class("BigScary.CloudItems.CosmeticSO"); } catch (_) {}
      if (!C) return;
      const all = Resources.method("FindObjectsOfTypeAll", 1).inflate(C).invoke();
      if (all == null || all.isNull()) return;
      for (let i = 0; i < all.length; i++) {
        try { all.get(i).field("isAlwaysOwned").value = true; } catch (_) {}
      }
      cosmeticsUnlocked = true;
    } catch (_) {}
  }
  function LockCosmetics() { cosmeticsUnlocked = false; }

  // ---------- gacha ----------
  let autoStopLegendary = false;
  let autoStopEpic = false;
  let autoStopRare = false;

  function AutoStopGacha() {
    if (!autoStopLegendary && !autoStopEpic && !autoStopRare) return;
    try {
      const cls = AssemblyCSharp.class("HeatGachaRollsController");
      if (!cls) return;
      const machines = Object.method("FindObjectsOfType").inflate(cls).invoke();
      if (machines == null || machines.isNull()) return;
      for (let i = 0; i < machines.length; i++) {
        const m = machines.get(i);
        if (m == null || m.isNull()) continue;
        const rarity = m.field("NILFBCEKKEA").value as number;
        let stop = false;
        if (autoStopLegendary && rarity === 4) stop = true;
        if (autoStopEpic && rarity === 3) stop = true;
        if (autoStopRare && rarity === 2) stop = true;
        if (!stop) continue;
        try { m.method("StopRollRPC").invoke(); } catch (_) {}
      }
    } catch (_) {}
  }

  // ---------- hitboxes ----------
  let hitboxScale = 1.0;
  let expandHitboxes = false;

  function UpdateHitboxes() {
    if (!PhotonVRPlayerClass) return;
    try {
      const mgr = PhotonVRManager.method("get_Manager").invoke();
      if (mgr == null || mgr.isNull()) return;
      const lp = mgr.field("LocalPlayer").value;
      if (lp == null || lp.isNull()) return;
      const all = Object.method("FindObjectsOfType").inflate(PhotonVRPlayerClass).invoke();
      if (all == null || all.isNull()) return;
      for (let i = 0; i < all.length; i++) {
        const p = all.get(i);
        if (p == null || p.isNull() || p.handle.equals(lp.handle)) continue;
        const inf = p.field("infectionComponent").value;
        if (inf == null || inf.isNull()) continue;
        const cols = inf.field("infectionColliders").value;
        if (cols == null || cols.isNull()) continue;
        for (let j = 0; j < cols.length; j++) {
          const c = cols.get(j);
          if (c == null || c.isNull()) continue;
          const s = expandHitboxes ? hitboxScale : 1.0;
          try { getTransform(c).method("set_localScale").invoke([s, s, s]); } catch (_) {}
        }
      }
    } catch (_) {}
  }

  // ---------- big scary ----------
  function BypassZombieLock() {
    try {
      const SM = UnityEngineCore.class("UnityEngine.SceneManagement.SceneManager");
      const methods = SM.methods.filter(m => m.name === "LoadScene" && m.parameterCount === 2);
      let target = null;
      for (const m of methods) if (m.parameters[0].type.name.includes("String")) { target = m; break; }
      if (target) target.invoke(Il2Cpp.string("Assets/Scenes/Extraction/Extraction_PylonMap.unity"), 1);
    } catch (e) { console.log("[Envo] bypass failed: " + e); }
  }

  function SpeedUpMonsters() {
    try {
      const types = [
        "BasicMonsterBehaviour", "HoundsBehaviour", "BasicBackroomsBehaviour",
        "NightSmilerBehaviour", "WhisperingWyrmBackroomsBehaviour", "SmileBallBehaviour", "Level36Monster"
      ];
      for (const name of types) {
        let k = null;
        try { k = AssemblyCSharp.class(name); } catch (_) {}
        if (!k) try { k = AssemblyCSharp.class("BigScary.AI." + name); } catch (_) {}
        if (!k) continue;
        const insts = Object.method("FindObjectsOfType").inflate(k).invoke();
        if (insts == null || insts.isNull()) continue;
        for (let i = 0; i < insts.length; i++) {
          const inst = insts.get(i);
          try { inst.field("chaseSpeed").value = 75000.0; } catch (_) {}
          try { inst.field("patrolSpeed").value = 75000.0; } catch (_) {}
        }
      }
    } catch (_) {}
  }

  function DumpScenes() {
    try {
      const SM = UnityEngineCore.class("UnityEngine.SceneManagement.SceneManager");
      const SU = UnityEngineCore.class("UnityEngine.SceneManagement.SceneUtility");
      const count = SM.method("get_sceneCountInBuildSettings").invoke();
      for (let i = 0; i < count; i++) {
        console.log("Scene " + i + ": " + SU.method("GetScenePathByBuildIndex").invoke(i).toString());
      }
    } catch (_) {}
  }

  // ================================================================
  // BUTTONS
  // ================================================================
  const buttons: ButtonInfo[][] = [

    [ // 0: Home
      new ButtonInfo({ buttonText: "Settings",  method: () => { currentCategory = 2;  currentPage = 0; }, keepOn: false }),
      new ButtonInfo({ buttonText: "Movement",  method: () => { currentCategory = 3;  currentPage = 0; }, keepOn: false }),
      new ButtonInfo({ buttonText: "Misc",      method: () => { currentCategory = 4;  currentPage = 0; }, keepOn: false }),
      new ButtonInfo({ buttonText: "OP",        method: () => { currentCategory = 5;  currentPage = 0; }, keepOn: false }),
      new ButtonInfo({ buttonText: "Rig Mods",  method: () => { currentCategory = 6;  currentPage = 0; }, keepOn: false }),
      new ButtonInfo({ buttonText: "Prefabs",   method: () => { currentCategory = 7;  currentPage = 0; }, keepOn: false }),
      new ButtonInfo({ buttonText: "Big Scary", method: () => { currentCategory = 8;  currentPage = 0; }, keepOn: false }),
      new ButtonInfo({ buttonText: "Colors",    method: () => { currentCategory = 9;  currentPage = 0; }, keepOn: false }),
      new ButtonInfo({ buttonText: "Names",     method: () => { currentCategory = 10; currentPage = 0; }, keepOn: false }),
      new ButtonInfo({ buttonText: "Fun",       method: () => { currentCategory = 11; currentPage = 0; }, keepOn: false }),
      new ButtonInfo({ buttonText: "UI Theme",  method: () => { currentCategory = 12; currentPage = 0; }, keepOn: false }),
      new ButtonInfo({ buttonText: "Credits",   method: () => { currentCategory = 13; currentPage = 0; }, keepOn: false }),
    ],

    [ // 1: nav
      new ButtonInfo({ buttonText: "Leave", method: () => PhotonNetwork.method("LeaveRoom", 1).invoke(true), keepOn: false }),
      new ButtonInfo({ buttonText: "Home",  method: () => { currentCategory = 0; currentPage = 0; }, keepOn: false }),
      new ButtonInfo({ buttonText: "PreviousPage", method: () => {
        const lp = Math.max(1, Math.ceil(buttons[currentCategory].length / 6)) - 1;
        currentPage--; if (currentPage < 0) currentPage = lp;
      }, keepOn: false }),
      new ButtonInfo({ buttonText: "NextPage", method: () => {
        const lp = Math.max(1, Math.ceil(buttons[currentCategory].length / 6)) - 1;
        currentPage++; currentPage %= lp + 1;
      }, keepOn: false }),
    ],

    [ // 2: Settings
      new ButtonInfo({ buttonText: "Fly Speed+",     method: () => { flyspeed += 1; reloadMenu(); }, keepOn: false }),
      new ButtonInfo({ buttonText: "Fly Speed-",     method: () => { flyspeed -= 1; reloadMenu(); }, keepOn: false }),
      new ButtonInfo({ buttonText: "Platform Color", method: () => { plater = (plater + 1) % platColors.length; platColor = platColors[plater]; }, keepOn: false }),
      new ButtonInfo({ buttonText: "Reset Fly",      method: () => { flyspeed = 5.0; reloadMenu(); }, keepOn: false }),
      new ButtonInfo({ buttonText: "Speed Mult+",    method: () => { speedBoostMult = Math.min(50, speedBoostMult + 1); reloadMenu(); }, keepOn: false }),
      new ButtonInfo({ buttonText: "Speed Mult-",    method: () => { speedBoostMult = Math.max(1, speedBoostMult - 1); reloadMenu(); }, keepOn: false }),
    ],

    [ // 3: Movement
      new ButtonInfo({ buttonText: "Fly [B]",            method: () => Fly(),           keepOn: true }),
      new ButtonInfo({ buttonText: "Velocity Fly [B]",   method: () => Velofly(),       keepOn: true }),
      new ButtonInfo({ buttonText: "Head Fly [B]",       method: () => headfly(),       keepOn: true }),
      new ButtonInfo({ buttonText: "Moon Walk [B]",      method: () => MoonWalk(),      keepOn: true }),
      new ButtonInfo({ buttonText: "Platforms [G]",      method: () => Platforms(),     keepOn: true }),
      new ButtonInfo({ buttonText: "Sphere Plats [G]",   method: () => Platformssphere(), keepOn: true }),
      new ButtonInfo({ buttonText: "No Clip [T]",        method: () => Noclip(),        keepOn: true }),
      new ButtonInfo({ buttonText: "Up & Down [T/G]",    method: () => UpAndDown(),     keepOn: true }),
      new ButtonInfo({ buttonText: "TP Forward",         method: () => TeleportForward(), keepOn: false }),
      new ButtonInfo({ buttonText: "TP Up",              method: () => TeleportUp(),      keepOn: false }),
      new ButtonInfo({ buttonText: "TP To Hand",         method: () => TeleportToHand(),  keepOn: false }),
      new ButtonInfo({ buttonText: "Toggle Gravity",     method: () => {
        const cur = rigidbody.method("get_useGravity").invoke() as boolean;
        rigidbody.method("set_useGravity").invoke(!cur);
      }, keepOn: false }),
      new ButtonInfo({ buttonText: "Zero Gravity",       enableMethod: () => { zeroGravEnabled = true; },  disableMethod: () => { zeroGravEnabled = false; },  method: () => ZeroGrav(),   keepOn: true }),
      new ButtonInfo({ buttonText: "Low Gravity",        method: () => {
        rigidbody.method("AddForce", 2).invoke([0, 6.66, 0], 5);
      }, keepOn: true }),
      new ButtonInfo({ buttonText: "High Gravity",       method: () => {
        rigidbody.method("AddForce", 2).invoke([0, -6.66, 0], 5);
      }, keepOn: true }),
      new ButtonInfo({ buttonText: "Reverse Gravity",    method: () => {
        rigidbody.method("AddForce", 2).invoke([0, 15.6, 0], 5);
      }, keepOn: true }),
      new ButtonInfo({ buttonText: "Iron Man [G]",       method: () => {
        if (leftGrab) {
          const v = leftHandTransform.method("get_right").invoke();
          rigidbody.method("AddForce", 2).invoke(vscale(v, -15.0 * deltaTime), 2);
        }
        if (rightGrab) {
          const v = rightHandTransform.method("get_right").invoke();
          rigidbody.method("AddForce", 2).invoke(vscale(v, 15.0 * deltaTime), 2);
        }
      }, keepOn: true }),
      new ButtonInfo({ buttonText: "Dash",               method: () => {
        if (rightPrimary && !previousDash) {
          const v = getTransform(headCollider).method("get_forward").invoke();
          rigidbody.method("AddForce", 2).invoke(vscale(v, 10.0), 2);
        }
        previousDash = rightPrimary;
      }, keepOn: true }),
      new ButtonInfo({ buttonText: "Long Arms",          enableMethod: () => {
        try { getTransform(GorillaTagger).method("set_localScale").invoke([1.25, 1.25, 1.25]); } catch (_) {}
      }, disableMethod: () => {
        try { getTransform(GorillaTagger).method("set_localScale").invoke([1, 1, 1]); } catch (_) {}
      }, keepOn: true }),
      new ButtonInfo({ buttonText: "Speed Boost",        enableMethod: () => { speedBoostEnabled = true; },  disableMethod: () => { speedBoostEnabled = false; }, method: () => SpeedBoost(), keepOn: true }),
      new ButtonInfo({ buttonText: "Bunny Hop",          enableMethod: () => { bunnyHopEnabled = true; },    disableMethod: () => { bunnyHopEnabled = false; },   method: () => BunnyHop(),   keepOn: true }),
      new ButtonInfo({ buttonText: "Rocket Jump [L+R]",  method: () => RocketJump(),  keepOn: true }),
      new ButtonInfo({ buttonText: "Speed Cycle",        enableMethod: () => { speedCycleEnabled = true; },  disableMethod: () => { speedCycleEnabled = false; }, method: () => SpeedCycle(), keepOn: true }),
      new ButtonInfo({ buttonText: "Wall Climb [G]",     enableMethod: () => { wallClimbEnabled = true; },   disableMethod: () => { wallClimbEnabled = false; },  method: () => WallClimb(),  keepOn: true }),
      new ButtonInfo({ buttonText: "Slide",              enableMethod: () => { slideEnabled = true; },       disableMethod: () => { slideEnabled = false; },      method: () => Slide(),      keepOn: true }),
      new ButtonInfo({ buttonText: "Freeze In Place",    enableMethod: () => { freezeEnabled = true; },      disableMethod: () => { freezeEnabled = false; },     method: () => FreezeInPlace(), keepOn: true }),
      new ButtonInfo({ buttonText: "Launch Up",          method: () => LaunchUp(),      keepOn: false }),
      new ButtonInfo({ buttonText: "Launch Forward",     method: () => LaunchForward(), keepOn: false }),
      new ButtonInfo({ buttonText: "Spin Body",          method: () => SpinBody(),      keepOn: true }),
      new ButtonInfo({ buttonText: "Jump Spam",          enableMethod: () => { jumpSpamEnabled = true; },    disableMethod: () => { jumpSpamEnabled = false; },   method: () => JumpSpam(),   keepOn: true }),
      new ButtonInfo({ buttonText: "High Jump",          method: () => HighJump(),      keepOn: false }),
      new ButtonInfo({ buttonText: "No Tag Freeze",      method: () => GTPlayer.field("disableMovement").value = false, keepOn: false }),
      new ButtonInfo({ buttonText: "Force Tag Freeze",   method: () => GTPlayer.field("disableMovement").value = true,  keepOn: false }),
      new ButtonInfo({ buttonText: "Fast Speed",         method: () => GTPlayer.field("maxJumpSpeed").value = 20.0, keepOn: false }),
      new ButtonInfo({ buttonText: "Very High Speed",    method: () => GTPlayer.field("maxJumpSpeed").value = 50.0, keepOn: false }),
    ],

    [ // 4: Misc
      new ButtonInfo({ buttonText: "Open Staff",          method: () => OpenStaff(), keepOn: false }),
      new ButtonInfo({ buttonText: "Ghost Rig [B]",       method: () => GhostRig(),  keepOn: true }),
      new ButtonInfo({ buttonText: "Invis Rig [B]",       method: () => InvisRig(),  keepOn: true }),
      new ButtonInfo({ buttonText: "Force Recover Rig",   method: () => ForceRecoverRig(), keepOn: false }),
      new ButtonInfo({ buttonText: "RGB Rig",             method: () => {
        const c = getSmoothColor();
        try { PhotonVRManager.method("SetColour").invoke([c.r, c.g, c.b, c.a]); } catch (_) {}
      }, keepOn: true }),
      new ButtonInfo({ buttonText: "Cycle Name",          enableMethod: () => toggleNameCycling(), disableMethod: () => toggleNameCycling(), keepOn: true }),
      new ButtonInfo({ buttonText: "Random Name",         enableMethod: () => { randomNameEnabled = true; }, disableMethod: () => { randomNameEnabled = false; }, method: () => RandomName(), keepOn: true }),
      new ButtonInfo({ buttonText: "Unlock Cosmetics",    enableMethod: () => UnlockAllCosmetics(), disableMethod: () => LockCosmetics(), keepOn: true }),
      new ButtonInfo({ buttonText: "Join Random",         method: () => { try { PhotonNetwork.method("JoinRandomRoom").invoke(); } catch (_) {} }, keepOn: false }),
      new ButtonInfo({ buttonText: "Info Gun",            method: () => getinfogun(), keepOn: true }),
      new ButtonInfo({ buttonText: "Log Players",         method: () => logAll(), keepOn: false }),
      new ButtonInfo({ buttonText: "Spoof ID",            method: () => spoofID(), keepOn: false }),
      new ButtonInfo({ buttonText: "Object Info Gun",     method: () => {
        if (!rightGrab) return;
        const cn = renderGun();
        const co = cn.ray;
        if (rightTrigger && co != null && !previousTeleportKey) {
          try {
            const col = co.method("get_collider").invoke();
            console.log("name: " + col.method("get_name").invoke().toString());
          } catch (_) {}
        }
        previousTeleportKey = rightTrigger;
      }, keepOn: true }),
      new ButtonInfo({ buttonText: "Get Position Gun",    method: () => {
        if (!rightGrab) return;
        const cn = renderGun();
        if (rightTrigger && !previousTeleportKey) {
          try { console.log("Pos: " + getTransform(cn.gunPointer).method("get_position").invoke().toString()); } catch (_) {}
        }
        previousTeleportKey = rightTrigger;
      }, keepOn: true }),
      new ButtonInfo({ buttonText: "72 FPS", method: () => {
        const td = 1 / 72;
        const e = Time.method("get_realtimeSinceStartup").invoke() - lastTime;
        if (e < td) {
          const s = Math.floor((td - e) * 1000);
          if (s > 0) try { Thread.method("Sleep", 1).invoke(s); } catch (_) {}
        }
        lastTime = Time.method("get_realtimeSinceStartup").invoke();
      }, keepOn: true }),
      new ButtonInfo({ buttonText: "60 FPS", method: () => {
        const td = 1 / 60;
        const e = Time.method("get_realtimeSinceStartup").invoke() - lastTime;
        if (e < td) {
          const s = Math.floor((td - e) * 1000);
          if (s > 0) try { Thread.method("Sleep", 1).invoke(s); } catch (_) {}
        }
        lastTime = Time.method("get_realtimeSinceStartup").invoke();
      }, keepOn: true }),
    ],

    [ // 5: OP
      new ButtonInfo({ buttonText: "Set Master",           method: () => { try { PhotonNetwork.method("SetMasterClient").invoke(PhotonNetwork.method("get_LocalPlayer").invoke()); } catch (_) {} }, keepOn: false }),
      new ButtonInfo({ buttonText: "Rig Spam [G]",         method: () => RigSpam(),    keepOn: true }),
      new ButtonInfo({ buttonText: "Rig Gun [G]",          method: () => RigGun(),     keepOn: true }),
      new ButtonInfo({ buttonText: "Lag All",              method: () => LagAll(),     keepOn: false }),
      new ButtonInfo({ buttonText: "Destroy All",          method: () => DestroyAll(), keepOn: false }),
      new ButtonInfo({ buttonText: "Rename All",           method: () => nameAll(),    keepOn: true }),
      new ButtonInfo({ buttonText: "Dump Scenes",          method: () => DumpScenes(), keepOn: false }),
      new ButtonInfo({ buttonText: "Bypass Zombie Lock",   method: () => BypassZombieLock(), keepOn: false }),
      new ButtonInfo({ buttonText: "Super Fast Monsters",  method: () => SpeedUpMonsters(), keepOn: true }),
      new ButtonInfo({ buttonText: "Hitbox +",             method: () => { hitboxScale = Math.min(20, hitboxScale + 1); reloadMenu(); }, keepOn: false }),
      new ButtonInfo({ buttonText: "Hitbox -",             method: () => { hitboxScale = Math.max(1, hitboxScale - 1); reloadMenu(); }, keepOn: false }),
      new ButtonInfo({ buttonText: "Hitbox Expander",      enableMethod: () => { expandHitboxes = true; UpdateHitboxes(); }, disableMethod: () => { expandHitboxes = false; UpdateHitboxes(); }, keepOn: true }),
      new ButtonInfo({ buttonText: "Rapid Fire",           enableMethod: () => { rapidFireEnabled = true; }, disableMethod: () => { rapidFireEnabled = false; }, keepOn: true }),
      new ButtonInfo({ buttonText: "Infinite Ammo",        enableMethod: () => { infiniteAmmoEnabled = true; }, disableMethod: () => { infiniteAmmoEnabled = false; }, keepOn: true }),
      new ButtonInfo({ buttonText: "No Recoil",            enableMethod: () => { noRecoilEnabled = true; }, disableMethod: () => { noRecoilEnabled = false; }, keepOn: true }),
      new ButtonInfo({ buttonText: "Instant Reload",       enableMethod: () => { instantReloadEnabled = true; }, disableMethod: () => { instantReloadEnabled = false; }, keepOn: true }),
      new ButtonInfo({ buttonText: "Auto Stop Legendary",  enableMethod: () => { autoStopLegendary = true; }, disableMethod: () => { autoStopLegendary = false; }, keepOn: true }),
      new ButtonInfo({ buttonText: "Auto Stop Epic",       enableMethod: () => { autoStopEpic = true; },      disableMethod: () => { autoStopEpic = false; },      keepOn: true }),
      new ButtonInfo({ buttonText: "Auto Stop Rare",       enableMethod: () => { autoStopRare = true; },      disableMethod: () => { autoStopRare = false; },      keepOn: true }),
    ],

    [ // 6: Rig
      new ButtonInfo({ buttonText: "Scale Arms",     method: () => { size = 1.3; scalearms(); }, keepOn: false }),
      new ButtonInfo({ buttonText: "Scale Arms [T]", method: () => scalearms(), keepOn: true }),
      new ButtonInfo({ buttonText: "Reset Arms",     method: () => { size = 1.0; scalearms(); }, keepOn: false }),
      new ButtonInfo({ buttonText: "Spin Bot",       method: () => spinbot(), keepOn: true }),
      new ButtonInfo({ buttonText: "Spaz Rig",       method: () => {
        try {
          const cam = getCamera();
          if (!cam || cam.isNull()) return;
          getTransform(cam).method("set_rotation").invoke(
            Quaternion.method("Euler").overload("System.Single","System.Single","System.Single")
              .invoke(Math.random() * 360, Math.random() * 360, Math.random() * 360)
          );
        } catch (_) {}
      }, keepOn: true }),
    ],

    [ // 7: Prefabs
      new ButtonInfo({ buttonText: "kyle Gun",        method: () => PrefabGun("my robot kyle -done-"), keepOn: true }),
      new ButtonInfo({ buttonText: "ZomBear Gun",     method: () => PrefabGun("ZomBear"),      keepOn: true }),
      new ButtonInfo({ buttonText: "ZomBunny Gun",    method: () => PrefabGun("ZomBunny"),     keepOn: true }),
      new ButtonInfo({ buttonText: "Boy Gun",         method: () => PrefabGun("Boy"),          keepOn: true }),
      new ButtonInfo({ buttonText: "Hellephant Gun",  method: () => PrefabGun("Hellephant"),   keepOn: true }),
      new ButtonInfo({ buttonText: "Character Gun",   method: () => PrefabGun("Character"),    keepOn: true }),
      new ButtonInfo({ buttonText: "Spaceship Gun",   method: () => PrefabGun("Spaceship"),    keepOn: true }),
      new ButtonInfo({ buttonText: "BigAsteroid Gun", method: () => PrefabGun("BigAsteroid"),  keepOn: true }),
      new ButtonInfo({ buttonText: "SmallAsteroid Gun", method: () => PrefabGun("SmallAsteroid"), keepOn: true }),
    ],

    [ // 8: Big Scary
      new ButtonInfo({ buttonText: "Zomb 2 gun",         method: () => PrefabGun("photonvr/zomb2"), keepOn: true }),
      new ButtonInfo({ buttonText: "Zomb gun",           method: () => PrefabGun("photonvr/zomb"),  keepOn: true }),
      new ButtonInfo({ buttonText: "Turret gun",         method: () => PrefabGun("Turret"), keepOn: true }),
      new ButtonInfo({ buttonText: "Extraction Boss gun", method: () => PrefabGun("PhotonVR/Extraction_ZombieBoss"), keepOn: true }),
      new ButtonInfo({ buttonText: "lvl 1 monster gun",  method: () => { try { PhotonNetwork.method("SetMasterClient").invoke(PhotonNetwork.method("get_LocalPlayer").invoke()); } catch (_) {} ObjGun("NAV1"); }, keepOn: true }),
      new ButtonInfo({ buttonText: "lvl 2 monster gun",  method: () => { try { PhotonNetwork.method("SetMasterClient").invoke(PhotonNetwork.method("get_LocalPlayer").invoke()); } catch (_) {} ObjGun("NAV2"); }, keepOn: true }),
      new ButtonInfo({ buttonText: "lvl 3 monster gun",  method: () => { try { PhotonNetwork.method("SetMasterClient").invoke(PhotonNetwork.method("get_LocalPlayer").invoke()); } catch (_) {} ObjGun("NAV3"); }, keepOn: true }),
      new ButtonInfo({ buttonText: "lvl 4 monster gun",  method: () => { try { PhotonNetwork.method("SetMasterClient").invoke(PhotonNetwork.method("get_LocalPlayer").invoke()); } catch (_) {} ObjGun("NAV4"); }, keepOn: true }),
      new ButtonInfo({ buttonText: "lvl 5 monster gun",  method: () => { try { PhotonNetwork.method("SetMasterClient").invoke(PhotonNetwork.method("get_LocalPlayer").invoke()); } catch (_) {} ObjGun("NAV5"); }, keepOn: true }),
      new ButtonInfo({ buttonText: "lvl 6 monster gun",  method: () => { try { PhotonNetwork.method("SetMasterClient").invoke(PhotonNetwork.method("get_LocalPlayer").invoke()); } catch (_) {} ObjGun("NAV6"); }, keepOn: true }),
    ],

    [ // 9: Colors
      new ButtonInfo({ buttonText: "Strobe B/W", method: () => strobe(),      keepOn: true }),
      new ButtonInfo({ buttonText: "White",      method: () => brightwhite(), keepOn: false }),
      new ButtonInfo({ buttonText: "Red",        method: () => { try { PhotonVRManager.method("SetColour").invoke([9999, 0, 0, 9999]); } catch (_) {} }, keepOn: false }),
      new ButtonInfo({ buttonText: "Green",      method: () => { try { PhotonVRManager.method("SetColour").invoke([0, 9999, 0, 9999]); } catch (_) {} }, keepOn: false }),
      new ButtonInfo({ buttonText: "Blue",       method: () => { try { PhotonVRManager.method("SetColour").invoke([0, 0, 9999, 9999]); } catch (_) {} }, keepOn: false }),
    ],

    [ // 10: Names
      new ButtonInfo({ buttonText: "J0kerModZ", method: () => PhotonNetwork.method("set_NickName").invoke(Il2Cpp.string("J0KERMODZ")), keepOn: false }),
      new ButtonInfo({ buttonText: "JaSC",      method: () => PhotonNetwork.method("set_NickName").invoke(Il2Cpp.string("JASC")),     keepOn: false }),
      new ButtonInfo({ buttonText: "Meme",      method: () => PhotonNetwork.method("set_NickName").invoke(Il2Cpp.string("67 420 1738")), keepOn: false }),
      new ButtonInfo({ buttonText: "Space",     method: () => PhotonNetwork.method("set_NickName").invoke(Il2Cpp.string("           ")), keepOn: false }),
      new ButtonInfo({ buttonText: "Big Scary", method: () => PhotonNetwork.method("set_NickName").invoke(Il2Cpp.string("BIG SCARY")), keepOn: false }),
      new ButtonInfo({ buttonText: "Owner",     method: () => PhotonNetwork.method("set_NickName").invoke(Il2Cpp.string("OFFICIAL OWNER")), keepOn: false }),
      new ButtonInfo({ buttonText: "GunyahJohn",      method: () => PhotonNetwork.method("set_NickName").invoke(Il2Cpp.string("GunyahJohn")), keepOn: false }),
      new ButtonInfo({ buttonText: "Strobe Name", method: () => strobename(), keepOn: true }),
    ],

    [ // 11: Fun
      new ButtonInfo({ buttonText: "Fake Lag",         method: () => fakelag(), keepOn: true }),
      new ButtonInfo({ buttonText: "Become J0kerModZ", method: () => { PhotonNetwork.method("set_NickName").invoke(Il2Cpp.string("J0KERMODZ")); try { PhotonVRManager.method("SetColour").invoke([0.9, 0.5, 0.9, 1]); } catch (_) {} }, keepOn: false }),
      new ButtonInfo({ buttonText: "Become JaSC",      method: () => { PhotonNetwork.method("set_NickName").invoke(Il2Cpp.string("JASC")); try { PhotonVRManager.method("SetColour").invoke([0.0, 0.9, 0.3, 1]); } catch (_) {} }, keepOn: false }),
      new ButtonInfo({ buttonText: "Fix Player",       method: () => { try { const p = GameObject.method("Find").invoke(Il2Cpp.string("GorillaPlayer")); getTransform(p).method("set_rotation").invoke([0, 0, 0, 0]); } catch (_) {} }, keepOn: false }),
    ],

    [ // 12: UI Theme
      new ButtonInfo({ buttonText: "Next Theme",  method: () => nextTheme(),  keepOn: false }),
      new ButtonInfo({ buttonText: "Prev Theme",  method: () => prevTheme(),  keepOn: false }),
      new ButtonInfo({ buttonText: "RGB Mode",    enableMethod: () => { rgbMode = true; }, disableMethod: () => { rgbMode = false; applyTheme(currentThemeIdx); reloadMenu(); }, keepOn: true }),
      new ButtonInfo({ buttonText: "J0ker Black", method: () => { applyTheme(1); reloadMenu(); }, keepOn: false }),
      new ButtonInfo({ buttonText: "Limes Green", method: () => { applyTheme(2); reloadMenu(); }, keepOn: false }),
      new ButtonInfo({ buttonText: "Blood Red",   method: () => { applyTheme(3); reloadMenu(); }, keepOn: false }),
      new ButtonInfo({ buttonText: "Ice Cyan",    method: () => { applyTheme(4); reloadMenu(); }, keepOn: false }),
      new ButtonInfo({ buttonText: "Matrix",      method: () => { applyTheme(5); reloadMenu(); }, keepOn: false }),
      new ButtonInfo({ buttonText: "Gold",        method: () => { applyTheme(6); reloadMenu(); }, keepOn: false }),
      new ButtonInfo({ buttonText: "Hot Pink",    method: () => { applyTheme(7); reloadMenu(); }, keepOn: false }),
      new ButtonInfo({ buttonText: "Sunset",      method: () => { applyTheme(8); reloadMenu(); }, keepOn: false }),
    ],

    [ // 13: Credits
      new ButtonInfo({ buttonText: "Envo", method: () => {}, keepOn: false }),
    ],
  ];

  const buttonMap: Map<string, ButtonInfo> = new Map();
  buttons.flat().forEach(b => buttonMap.set(b.buttonText, b));

  function getIndex(buttonText: string): ButtonInfo | undefined {
    return buttonMap.get(buttonText);
  }

  // ================================================================
  // HOOKS
  // ================================================================
  const origOnTriggerEnter = GorillaReportButton.method("OnTriggerEnter");

  const replacementTrigger = function (collider: any) {
    let rawName = "";
    try { rawName = this.method("get_name").invoke().toString(); } catch (_) {}

    if (rawName.length > 1 && rawName[1] == "@") {
      if (referenceCollider == null) return;
      let matches = false;
      try { matches = collider.handle.equals(referenceCollider.handle); } catch (_) {}
      if (!matches) return;

      const goName = rawName.substring(2, rawName.length - 1);
      const _time = Time.method("get_time").invoke();
      if (_time > buttonClickDelay) {
        buttonClickDelay = _time + 0.2;
        const button = getIndex(goName);
        if (button) {
          if (button.keepOn) {
            button.enabled = !button.enabled;
            if (button.enabled) button.enableMethod?.();
            else button.disableMethod?.();
          } else {
            button.method?.();
          }
          reloadMenu();
        }
      }
      return;
    }

    // Non-menu trigger — call the original safely via revert/replace.
    try {
      origOnTriggerEnter.revert();
      let r;
      try { r = origOnTriggerEnter.bind(this).invoke(collider); }
      finally { origOnTriggerEnter.implementation = replacementTrigger; }
      return r;
    } catch (_) {
      try { origOnTriggerEnter.implementation = replacementTrigger; } catch (_) {}
    }
  };

  origOnTriggerEnter.implementation = replacementTrigger;

  // ---------- LateUpdate ----------
  const LateUpdate = GTPlayer.method("Update");
  LateUpdate.implementation = function () {
    try { AutoStopGacha(); } catch (_) {}

    if (OVRInputHandler) {
      try {
        OVRInputHandler.update();
        leftPrimary    = OVRInputHandler.leftControllerPrimaryButton;
        leftSecondary  = OVRInputHandler.leftControllerSecondaryButton;
        rightPrimary   = OVRInputHandler.rightControllerPrimaryButton;
        rightSecondary = OVRInputHandler.rightControllerSecondaryButton;
        leftGrab       = OVRInputHandler.leftGrab;
        rightGrab      = OVRInputHandler.rightGrab;
        leftTrigger    = OVRInputHandler.leftControllerTriggerButton;
        rightTrigger   = OVRInputHandler.rightControllerTriggerButton;
      } catch (_) {}
    }

    try {
      deltaTime = Time.method("get_deltaTime").invoke();
      time = Time.method("get_time").invoke();
    } catch (_) {}

    // menu show/hide
    if (leftSecondary) {
      if (menu == null) {
        try { renderMenu(); } catch (_) { menu = null; }
      } else {
        try { menu.method("SetActive").invoke(true); } catch (_) {}
        recenterMenu();
      }
    } else {
      if (menu != null) {
        try { if (!menu.isNull()) menu.method("SetActive").invoke(false); } catch (_) {}
      }
    }

    if (menu == null) {
      if (reference != null) { Destroy(reference); reference = null; referenceCollider = null; refText = null; refTextObj = null; }
    } else {
      if (reference == null) renderReference();
    }

    // RGB theme — retint without rebuilding
    if (rgbMode && menu != null) {
      const now = Date.now();
      if (now - lastRgbReload > 150) {
        lastRgbReload = now;
        applyRgbTheme();
        try {
          const targetMods = buttons[currentCategory].slice(currentPage * 6).slice(0, 6);
          // retint the currently visible buttons via their renderers
          // (grab them by walking menu's children once)
          const found: any[] = [];
          const collect = (root: any) => {
            if (!root) return;
            try {
              const rend = getComponent(root, Renderer);
              if (rend) found.push(rend);
              const t = getTransform(root);
              const cnt = t.method("get_childCount").invoke();
              for (let i = 0; i < cnt; i++) {
                collect(getTransform(t.method("GetChild").invoke(i)));
              }
            } catch (_) {}
          };
          // We don't actually need to repaint every child — the visible buttons
          // are the last few descendants. Just update the hand indicator and
          // let the theme colors apply on next rebuild.
          updateIndicator();
        } catch (_) {}
      }
    }

    // per-frame gun tick
    try { GunTick(); } catch (_) {}

    // hand indicator refresh (cheap)
    if (menu != null && refText != null) {
      const now = Date.now();
      if (now - lastIndicatorUpdate > 200) {
        lastIndicatorUpdate = now;
        updateIndicator();
      }
    }

    // cleanup stale gun pointer
    try {
      if (GunPointer != null) {
        if (!GunPointer.method("get_activeSelf").invoke()) { Destroy(GunPointer); GunPointer = null; }
        else GunPointer.method("SetActive").invoke(false);
      }
    } catch (_) {}

    // run enabled mods
    for (let ci = 0; ci < buttons.length; ci++) {
      const cat = buttons[ci];
      for (let bi = 0; bi < cat.length; bi++) {
        const b = cat[bi];
        if (!b.enabled || !b.method) continue;
        try { b.method(); } catch (e) {
          console.error(`[-] ${b.buttonText} failed:`, e);
        }
      }
    }

    return LateUpdate.invoke();
  };

  console.log(`[+] compiled ${new Date().toISOString()}`);
}, "main");