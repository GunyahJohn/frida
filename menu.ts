declare const Il2Cpp: any;
declare const console: any;
declare const System: any;
declare const XRNode: any;
declare const Random: any;
declare const UnityEngine: any;

let rigidbody = null
let hue = 0;
let rgbLastTime = 0;
let lastRunTime = 0;

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
let perviousDestroyKey = false;

let bgColor: [number, number, number, number] = [15 / 255, 0 / 255, 0 / 255, 1.0];
let bgColor2: [number, number, number, number] = [40 / 255, 0 / 255, 0 / 255, 1.0];
let textColor: [number, number, number, number] = [1.0, 0.85, 0.85, 1.0];
let buttonColor: [number, number, number, number] = [100 / 255, 0 / 255, 10 / 255, 1.0];
let buttonPressedColor: [number, number, number, number] = [200 / 255, 20 / 255, 20 / 255, 1.0];

let menuName: string = "Gunyah.lol";
let themeIndex = 0;
class XRInputHandler {
  private InputDevices: any;
  private tryGetFeatureValue: any;
  private buttonStates: Map<string, boolean>;

  constructor() {
    this.InputDevices = Il2Cpp.domain
      .assembly("UnityEngine.XRModule")
      .image.class("UnityEngine.XR.InputDevices");

    this.tryGetFeatureValue = this.InputDevices.method("TryGetFeatureValue_bool", 3);
    this.buttonStates = new Map();
  }

  update() {
    this.updateControllerStates(1); // left controller
    this.updateControllerStates(2); // right controller
  }

  private updateControllerStates(controllerId: number) {
    const features = [
      "PrimaryButton",
      "SecondaryButton",
      "GripButton",
      "TriggerButton",
      "MenuButton"
    ];

    features.forEach(feature => {
      const key = `${controllerId}_${feature}`;
      this.buttonStates.set(key, this.getButtonState(controllerId, feature));
    });
  }

  private getButtonState(deviceId: number, featureName: string): boolean {
    try {
      const valuePtr = Il2Cpp.alloc(1);
      const feature = Il2Cpp.string(featureName);
      const success = this.tryGetFeatureValue.invoke(uint64(deviceId), feature, valuePtr);
      if (success) {
        return valuePtr.readU8() !== 0;
      }
    } catch (_) { }
    return false;
  }

  isButtonPressed(controllerId: number, feature: string): boolean {
    return this.buttonStates.get(`${controllerId}_${feature}`) || false;
  }

  get leftControllerPrimaryButton(): boolean { return this.isButtonPressed(1, "PrimaryButton"); }
  get leftControllerSecondaryButton(): boolean { return this.isButtonPressed(1, "SecondaryButton"); }
  get rightControllerPrimaryButton(): boolean { return this.isButtonPressed(1, "PrimaryButton"); }
  get rightControllerSecondaryButton(): boolean { return this.isButtonPressed(1, "SecondaryButton"); }
  get leftGrab(): boolean { return this.isButtonPressed(1, "GripButton"); }
  get rightGrab(): boolean { return this.isButtonPressed(1, "GripButton"); }
  get leftControllerTriggerButton(): boolean { return this.isButtonPressed(1, "TriggerButton"); }
  get rightControllerTriggerButton(): boolean { return this.isButtonPressed(1, "TriggerButton"); }
  get controllerMenuButton(): boolean {
    return this.isButtonPressed(1, "MenuButton") || this.isButtonPressed(2, "MenuButton");
  }
}

Il2Cpp.perform(() => {
  const images = {
    "Assembly-CSharp": Il2Cpp.domain.assembly("Assembly-CSharp").image,
    "UnityEngine.CoreModule": Il2Cpp.domain.assembly("UnityEngine.CoreModule").image,
    "UnityEngine.PhysicsModule": Il2Cpp.domain.assembly("UnityEngine.PhysicsModule").image,
    "UnityEngine.UIModule": Il2Cpp.domain.assembly("UnityEngine.UIModule").image,
    "UnityEngine.UI": Il2Cpp.domain.assembly("UnityEngine.UI").image,
    "UnityEngine": Il2Cpp.domain.assembly("UnityEngine").image,
    "UnityEngine.TextRenderingModule": Il2Cpp.domain.assembly("UnityEngine.TextRenderingModule").image,
    "PhotonUnityNetworking": Il2Cpp.domain.assembly("PhotonUnityNetworking").image
  };

  const AssemblyCSharp = images["Assembly-CSharp"];
  const UnityEngineCore = images["UnityEngine.CoreModule"];
  const UnityEnginePhysics = images["UnityEngine.PhysicsModule"];
  const UnityEngineUI = images["UnityEngine.UI"];
  const UnityEngineUIModule = images["UnityEngine.UIModule"];
  const UnityEngineTextRendering = images["UnityEngine.TextRenderingModule"];
  const PhotonUnityNetworking = images["PhotonUnityNetworking"];
  const PhotonVRManager = AssemblyCSharp.class("Photon.VR.PhotonVRManager");
  const GTPlayerClass = AssemblyCSharp.class("GorillaLocomotion.Player");
  const GorillaReportButton = AssemblyCSharp.class("RedirectOnTriggerEnter");
  const PhotonNetwork = PhotonUnityNetworking.class("Photon.Pun.PhotonNetwork");
  const PhotonViewClass = PhotonUnityNetworking.class("Photon.Pun.PhotonView");
  const GTPlayer = GTPlayerClass.method("get_Instance").invoke();
  const GameObject = UnityEngineCore.class("UnityEngine.GameObject");
  const Object = UnityEngineCore.class("UnityEngine.Object");
  const Component = UnityEngineCore.class("UnityEngine.Component");
  const Vector3 = UnityEngineCore.class("UnityEngine.Vector3");
  const Quaternion = UnityEngineCore.class("UnityEngine.Quaternion");
  const Time = UnityEngineCore.class("UnityEngine.Time");
  const Resources = UnityEngineCore.class("UnityEngine.Resources");
  const Renderer = UnityEngineCore.class("UnityEngine.Renderer");
  const Shader = UnityEngineCore.class("UnityEngine.Shader");
  const RectTransform = UnityEngineCore.class("UnityEngine.RectTransform");
  const MeshCollider = UnityEnginePhysics.class("UnityEngine.Collider");
  const BoxCollider = UnityEnginePhysics.class("UnityEngine.BoxCollider");
  const Collider = UnityEnginePhysics.class("UnityEngine.Collider");
  const Rigidbody = UnityEnginePhysics.class("UnityEngine.Rigidbody");
  const Physics = UnityEnginePhysics.class("UnityEngine.Physics");
  const SystemObject = Il2Cpp.corlib.class("System.Object");
  const bybyeeeClass = AssemblyCSharp.class("bybyeee");
  const PlayfabLogin = AssemblyCsharp.class("PlayFabLogin");

  const Canvas = UnityEngineUIModule.class("UnityEngine.Canvas");
  const CanvasScaler = UnityEngineUI.class("UnityEngine.UI.CanvasScaler");
  const GraphicRaycaster = UnityEngineUI.class("UnityEngine.UI.GraphicRaycaster");
  const Text = UnityEngineUI.class("UnityEngine.UI.Text");
  const Font = UnityEngineTextRendering.class("UnityEngine.Font");
  const GorillaTagger = GTPlayer

  for (const field of GTPlayerClass.fields) {
    if (field.type.name == "UnityEngine.Rigidbody") {
      rigidbody = GTPlayer.field(field.name).value
    }
  }

  const MenuShader = Shader.method("Find").invoke(Il2Cpp.string("Unlit/Color"));
  const TextShader = Shader.method("Find").invoke(Il2Cpp.string("GUI/Text Shader"));

  const zeroVector = Vector3.field("zeroVector").value;
  const oneVector = Vector3.field("oneVector").value;
  const identityQuaternion = Quaternion.field("identityQuaternion").value;

  const leftHandTransform = GorillaTagger.field("leftHandTransform").value;
  const rightHandTransform = GorillaTagger.field("rightHandTransform").value;
  const headCollider = GorillaTagger.field("headCollider").value;
  let mutationName: string = "None";
  let ovrideBool: boolean;

  const OVRInputHandler = new XRInputHandler();

  const arial = Resources
    .method("GetBuiltinResource", 1)
    .inflate(Font)
    .invoke(Il2Cpp.string("Arial.ttf"));

  function Destroy(object) {
    Object.method("Destroy", 1).invoke(object);
  }

  function getComponent(obj: any, type) {
    return obj.method("GetComponent", 1).inflate(type).invoke();
  }

  function addComponent(obj: any, type) {
    return obj.method("AddComponent", 1).inflate(type).invoke();
  }

  function getComponentInParent(obj: any, type) {
    return obj.method("GetComponentInParent", 0).inflate(type).invoke();
  }

  function getTransform(obj: any) {
    return obj.method("get_transform").invoke();
  }

  function sendAllOutgoing() { PhotonNetwork.method("SendAllOutgoingCommands").invoke(); }

  function hsl2Rgb(h, s, l) {
    s /= 100;
    l /= 100;
    const k = (n) => (n + h / 30) % 12;
    const a = s * Math.min(l, 1 - l);
    const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
    return [
      Math.round(255 * f(0)),
      Math.round(255 * f(8)),
      Math.round(255 * f(4))
    ];
  }

  function getSmoothColor() {
    hue = (hue + 0.5) % 360;
    const [r, g, b] = hsl2Rgb(hue, 100, 50);
    return { r: r / 255, g: g / 255, b: b / 255, a: 1.0 };
  }


    function getLogin(): Il2Cpp.Object | null {


        const instances = Il2Cpp.gc.choose(PlayfabLogin);


        return instances.length > 0 ? instances[0] : null;


    }





    function safeSetActive(go: Il2Cpp.Object, enabled: boolean) {


        try {


            if (go.isNull()) return;


            go.method("SetActive").invoke(enabled);


        } catch (e) {


            console.log("SetActive failed:", e);


        }


    }





    function handleList(list: Il2Cpp.Object | null, enabled: boolean) {


        try {


            if (!list || list.isNull()) return;


            const count = list.method<number>("get_Count").invoke();


            for (let i = 0; i < count; i++) {


                const go = list.method<Il2Cpp.Object>("get_Item").invoke(i);


                if (go && !go.isNull()) safeSetActive(go, enabled);


            }


        } catch (e) {


            console.log("handleList failed:", e);


        }


    }

    function PlayfabPatcher() {

        const login = getLogin();


        if (!login) return;

        handleList(login.field<Il2Cpp.Object>("specialitems").value, true);


        handleList(login.field<Il2Cpp.Object>("disableitems").value, false);


    }
    Il2Cpp.mainThread.schedule(PlayfabPatcher);


  function renderMenuText(canvasObject, text: string = "", color: [number, number, number, number] = [1, 1, 1, 1], pos = zeroVector, size = oneVector) {
    const title = addComponent(createObject(zeroVector, identityQuaternion, oneVector, 3, [0, 0, 0, 0], getTransform(canvasObject)), Text);
    getComponent(title, BoxCollider).method("set_isTrigger").invoke(true);
    title.method("set_text").invoke(Il2Cpp.string(text));
    title.method("set_font").invoke(arial);
    title.method("set_fontSize").invoke(1);
    title.method("set_color").invoke(color);
    title.method("set_fontStyle").invoke(3);
    title.method("set_alignment").invoke(4);
    title.method("set_resizeTextForBestFit").invoke(true);
    title.method("set_resizeTextMinSize").invoke(0);

    const rectTransform = getComponent(title, RectTransform);
    rectTransform.method("set_sizeDelta").invoke(size);
    rectTransform.method("set_position").invoke(pos);
    rectTransform.method("set_rotation").invoke(Quaternion.method("Euler").invoke(180.0, 90.0, 90.0))
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
      renderer.method("set_enabled").invoke(false);
    } else {
      const material = renderer.method("get_material").invoke();
      material.method("set_shader").invoke(MenuShader);
      material.method("set_color").invoke(colorArr);
    }

    const transform = getTransform(obj);
    if (parent != null) {
      transform.method("SetParent", 2).invoke(parent, false);
    }

    transform.method("set_position").invoke(pos);
    transform.method("set_rotation").invoke(rot);
    transform.method("set_localScale").invoke(scale);

    return obj;
  }

  function renderMenu() {
    menu = createObject(zeroVector, identityQuaternion, [0.1, 0.3, 0.3825], 3, [0, 0, 0, 0]);
    Destroy(getComponent(menu, BoxCollider))

    const menuBackground = createObject([0.1, 0, 0], identityQuaternion, [0.1, 0.86, 0.7], 3, bgColor, getTransform(menu))
    Destroy(getComponent(menuBackground, BoxCollider))

    const menuBackground2 = createObject([0.1, 0, 0], identityQuaternion, [0.09, 0.88, 0.72], 3, bgColor2, getTransform(menu))
    Destroy(getComponent(menuBackground2, BoxCollider))

    const canvasObject = createObject(zeroVector, identityQuaternion, oneVector, 3, [0, 0, 0, 0], getTransform(menu));
    const canvas = addComponent(canvasObject, Canvas);
    Destroy(getComponent(canvasObject, BoxCollider))

    const canvasScaler = addComponent(canvasObject, CanvasScaler);
    addComponent(canvasObject, GraphicRaycaster);
    canvas.method("set_renderMode").invoke(2);
    canvasScaler.method("set_dynamicPixelsPerUnit").invoke(1000.0);

    const homeButton = createObject([0.1, -0.06, 0.205], identityQuaternion, [0.09, 0.2682, 0.075], 3, buttonColor, getTransform(menu));
    const homeButton2 = createObject([0.1, -0.06, 0.205], identityQuaternion, [0.08, 0.3, 0.1], 3, bgColor2, getTransform(menu));
    homeButton.method("set_name").invoke(Il2Cpp.string("@Home"));

    addComponent(homeButton, GorillaReportButton);
    getComponent(homeButton, BoxCollider).method("set_isTrigger").invoke(true);

    renderMenuText(canvasObject, "Home", textColor, [0.105, -0.06, 0.205], [0.15, 0.15]);
    renderMenuText(canvasObject, "discord.gg/aF6xdVT2N5", textColor, [0.107, 0, -0.120], [.5, .5]);

    const leaveButton = createObject([0.1, 0.06, 0.205], identityQuaternion, [0.09, 0.2682, 0.075], 3, buttonColor, getTransform(menu));
    const leaveButton2 = createObject([0.1, 0.06, 0.205], identityQuaternion, [0.08, 0.3, 0.1], 3, bgColor2, getTransform(menu));
    leaveButton.method("set_name").invoke(Il2Cpp.string("@Leave"));

    addComponent(leaveButton, GorillaReportButton);
    getComponent(leaveButton, BoxCollider).method("set_isTrigger").invoke(true);

    renderMenuText(canvasObject, "Leave", textColor, [0.105, 0.06, 0.205], [0.15, 0.15]);

    renderMenuText(canvasObject, menuName + ` - Page [ <color=cyan>${currentPage + 1} </color>]`, textColor, [0.11, 0, 0.155], [1, .1]);
    {
      const pageButton = createObject([0.1, 0.17, 0], identityQuaternion, [0.09, 0.15, 0.58], 3, buttonColor, getTransform(menu));
      const pageButton2 = createObject([0.1, 0.17, 0], identityQuaternion, [0.08, 0.16, 0.59], 3, bgColor2, getTransform(menu));
      pageButton.method("set_name").invoke(Il2Cpp.string("@PreviousPage"));


      addComponent(pageButton, GorillaReportButton);
      getComponent(pageButton, BoxCollider).method("set_isTrigger").invoke(true);
      renderMenuText(canvasObject, "←", textColor, [0.11, 0.17, 0], [1, 0.1]);
    }

    {
      const pageButton = createObject([0.1, -0.17, 0], identityQuaternion, [0.09, 0.15, 0.58], 3, buttonColor, getTransform(menu));
      const pageButton2 = createObject([0.1, -0.17, 0], identityQuaternion, [0.08, 0.16, 0.59], 3, bgColor2, getTransform(menu));
      pageButton.method("set_name").invoke(Il2Cpp.string("@NextPage"));


      addComponent(pageButton, GorillaReportButton);
      getComponent(pageButton, BoxCollider).method("set_isTrigger").invoke(true);
      renderMenuText(canvasObject, "→", textColor, [0.11, -0.17, 0], [1, 0.1]);
    }

    let i = 0;
    const targetMods = buttons[currentCategory]
      .slice(currentPage * 6)
      .slice(0, 6);


    targetMods.forEach((buttonData) => {
      const button = createObject([0.105, 0, 0.11 - (i * 0.04)], identityQuaternion, [0.09, 0.8, 0.08], 3, buttonColor, getTransform(menu));
      button.method("set_name").invoke(Il2Cpp.string("@" + buttonData.buttonText));

      addComponent(button, GorillaReportButton);
      getComponent(button, BoxCollider).method("set_isTrigger").invoke(true);
      renderMenuText(canvasObject, buttonData.buttonText, textColor, [0.11, 0, 0.11 - (i * 0.04)], [1, 0.1]);
      updateButtonColor(button, buttonData);
      i++;
    });

    recenterMenu();
  }

  function renderReference() {
    reference = createObject(zeroVector, identityQuaternion, [0.01, 0.01, 0.01], 0, bgColor2, rightHandTransform)
    referenceCollider = getComponent(reference, Collider);

    getTransform(reference).method("set_localPosition").invoke([-0.02, 0.015, 0.13]);
    reference.method("set_layer").invoke(2);
    addComponent(reference, Rigidbody).method("set_isKinematic").invoke(true);
  }

  let gunLocked = false;
  let lockTarget = null;
  let GunPointer = null;
  let GunLine = null;

  function renderGun(overrideLayerMask = null) {
    const StartPosition = rightHandTransform.method("get_position").invoke();
    const Direction = rightHandTransform.method("get_forward").invoke();

    const DirectionDivided = Vector3.method("op_Division").invoke(Direction, 4);
    const rayStartPosition = Vector3.method("op_Addition").invoke(StartPosition, DirectionDivided);

    const layerMask = overrideLayerMask || -3180559;

    const hits = Physics.method("RaycastAll", 4).invoke(rayStartPosition, Direction, 512.0, layerMask);
    let finalDistance = Infinity;
    let finalRay = null;
    for (const hit of hits) {
      const distance = Vector3.method("Distance").invoke(hit.method("get_point").invoke(), StartPosition);
      if (distance < finalDistance) {
        finalRay = hit;
        finalDistance = distance;
      }
    }

    let EndPosition;
    if (gunLocked) {
      EndPosition = getTransform(lockTarget).method("get_position").invoke();
    } else {
      EndPosition = finalRay.method("get_point").invoke();
    }

    if (Vector3.method("op_Equality").invoke(EndPosition, zeroVector)) {
      const farDirection = Vector3.method("op_Multiply").invoke(Direction, 512);
      EndPosition = Vector3.method("op_Addition").invoke(StartPosition, farDirection);
    }

    if (GunPointer == null) {
      GunPointer = createObject(EndPosition, identityQuaternion, [0.1, 0.1, 0.1], 0, [1, 1, 1, 1]);
    }

    GunPointer.method("SetActive").invoke(true);
    const pointerTransform = getTransform(GunPointer);
    pointerTransform.method("set_position").invoke(EndPosition);

    const PointerRenderer = getComponent(GunPointer, Renderer);
    const material = PointerRenderer.method("get_material").invoke();

    material.method("set_shader").invoke(TextShader);

    const pointerColor = (gunLocked || rightTrigger) ? buttonPressedColor : buttonColor;
    material.method("set_color").invoke(pointerColor);

    const collider = getComponent(GunPointer, Collider);
    if (collider != null) {
      Destroy(collider);
    }


    if (rightTrigger || gunLocked) {
      const Step = 10;
      for (let i = 1; i < (Step - 1); i++) {
        const t = i / (Step - 1);
        const Position = Vector3.method("Lerp").invoke(StartPosition, EndPosition, t);

        const randomValue = Math.random();
        let offset = zeroVector;

        if (randomValue > 0.75) {
          offset = [
            (Math.random() * 0.2) - 0.1,
            (Math.random() * 0.2) - 0.1,
            (Math.random() * 0.2) - 0.1
          ];
        }

      }

    }
    return { ray: finalRay, gunPointer: GunPointer };
  }

  function recenterMenu() {
    let menuPosition = leftHandTransform.method("get_position").invoke();
    let menuRotation = leftHandTransform.method("get_rotation").invoke();

    menuRotation = Quaternion.method("op_Multiply", 2).invoke(menuRotation, Quaternion.method("Euler").invoke(-45, 0, 0))

    const menuTransform = getTransform(menu);
    menuTransform.method("set_position").invoke(menuPosition);
    menuTransform.method("set_rotation").invoke(menuRotation);
  }

  function reloadMenu() {
    if (menu != null) {
      Object.method("Destroy", 1).invoke(menu);
      menu = null;
    }
  }

  function updateButtonColor(button, buttonData) {
    const RendererClass = Il2Cpp.domain
      .assembly("UnityEngine.CoreModule")
      .image
      .class("UnityEngine.Renderer");

    const renderer = getComponent(button, RendererClass);
    if (!renderer) {
      return;
    }

    const material = renderer.method("get_material").invoke();
    material.method("set_color").invoke(buttonData.enabled ? buttonPressedColor : buttonColor);
  }

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

  let currentCategory = 0;
  let currentPage = 0;

  //#region Mods

  //#region Player
  let flyspeed = 5.0;
  let ghost = false;
  let spawnedRig = null;

  function Fly() {
    if (rightPrimary) {
      rigidbody.method("set_velocity").invoke(Vector3.field("zeroVector").value);

      const transform = getTransform(GorillaTagger);
      let forward = getTransform(rightHandTransform).method("get_forward").invoke();

      let position = transform.method("get_position").invoke();
      forward = Vector3.method("op_Multiply", 2).invoke(forward, flyspeed * deltaTime);

      position = Vector3.method("op_Addition", 2).invoke(position, forward);

      transform.method("set_position").invoke(position);
    }
  }

function HeadFly() {
    if (rightPrimary) {
        rigidbody.method("set_velocity").invoke(Vector3.field("zeroVector").value);

        let camera = GameObject.method("Find").invoke(Il2Cpp.string("MainCamera"));

        if (!camera) {
            camera = GameObject.method("Find").invoke(Il2Cpp.string("Main Camera"));
        }

        const transform = getTransform(GorillaTagger);
        let forward = camera.method("get_transform").invoke().method("get_forward").invoke();

        let position = transform.method("get_position").invoke();

        forward = Vector3.method("op_Multiply", 2).invoke(forward, flyspeed * deltaTime);
        position = Vector3.method("op_Addition", 2).invoke(position, forward);

        transform.method("set_position").invoke(position);
    }
}

  function GhostRig() {
    if (rightSecondary) {
      const now = Date.now();
      if (now - lastRunTime >= 500) {
        lastRunTime = now;
        ghost = !ghost;
        const getManagerMethod = PhotonVRManager.method("get_Manager");
        const managerInstance = getManagerMethod.invoke();
        const localPlayer = managerInstance.field("LocalPlayer").value;
        localPlayer.method("set_enabled").invoke(!ghost);
      }
    }
  }

  function InvisRig() {
    if (rightSecondary) {
      const now = Date.now();
      if (now - lastRunTime >= 500) {
        lastRunTime = now;
        ghost = !ghost;

        if (ghost) {
          if (spawnedRig != null) {
            PhotonNetwork.method("DestroyPlayerObjects").invoke(
              PhotonNetwork.method("get_LocalPlayer").invoke()
            );
            spawnedRig = null;
          }
        } else {
          if (spawnedRig == null) {
            spawnedRig = PhotonNetwork.method("Instantiate", 5).invoke(
              Il2Cpp.string("photonvr/OnlinePlayerRig"),
              getTransform(headCollider).method("get_position").invoke(),
              identityQuaternion,
              0,
              NULL
            );
            sendAllOutgoing();
          }
        }
      }
    }
  }
  //#region  Platforms
  let platColor: [number, number, number, number] = [0.0, 0.0, 0.0, 1.0];
  const platColors: [number, number, number, number][] = [
    [0.0, 0.0, 0.0, 1.0],       // Black
    [9.0, 9.0, 9.0, 1.0],       // Bright white
    [9.0, 0.0, 0.0, 1.0],       // Red
    [0.0, 9.0, 0.0, 1.0],       // Green
    [0.0, 0.0, 9.0, 1.0],       // Blue
    [5.0, 5.0, 0.0, 1.0],       // Yellow
    [9.0, 0.5, 9.0, 1.0],       // Magenta
  ];
  let platL = null;
  let platR = null;
  let plater = 0;

  function Platforms() {
    if (leftGrab) {
      if (platL == null) {
        const handTransform = leftHandTransform;
        platL = createObject(Vector3.method("op_Addition", 2).invoke(handTransform.method("get_position").invoke(), [0.01, -0.035, 0.0]), handTransform.method("get_rotation").invoke(), [0.025, 0.25, 0.3], 3, platColor);
      }
    } else {
      if (platL != null) {
        Destroy(platL);
        platL = null;
      }
    }

    if (rightGrab) {
      if (platR == null) {
        const handTransform = rightHandTransform;
        platR = createObject(Vector3.method("op_Addition", 2).invoke(handTransform.method("get_position").invoke(), [0.0, -0.035, 0.0]), handTransform.method("get_rotation").invoke(), [0.025, 0.25, 0.3], 3, platColor);
      }
    } else {
      if (platR != null) {
        Destroy(platR);
        platR = null;
      }
    }
  }

function StickyPlatforms() {
  const offsets = [
    [0.0,   0.085, 0.0],   // top
    [0.0,  -0.085, 0.0],   // bottom
    [0.085, 0.0,   0.0],   // right
    [-0.085, 0.0,  0.0],   // left
  ];

  const size = [0.025, 0.25, 0.3];

  if (leftGrab) {
    if (platL == null) {
      const pos = leftHandTransform.method("get_position").invoke();
      const rot = leftHandTransform.method("get_rotation").invoke();
      platL = offsets.map(offset =>
        createObject(
          Vector3.method("op_Addition", 2).invoke(pos, offset),
          rot, size, 3, platColor
        )
      );
    }
  } else {
    if (platL != null) {
      platL.forEach(p => Destroy(p));
      platL = null;
    }
  }

  if (rightGrab) {
    if (platR == null) {
      const pos = rightHandTransform.method("get_position").invoke();
      const rot = rightHandTransform.method("get_rotation").invoke();
      platR = offsets.map(offset =>
        createObject(
          Vector3.method("op_Addition", 2).invoke(pos, offset),
          rot, size, 3, platColor
        )
      );
    }
  } else {
    if (platR != null) {
      platR.forEach(p => Destroy(p));
      platR = null;
    }
  }
}

  //#endregion

  //#region  NoClip

  function Noclip() {
    if (rightPrimary && !previousNoclipKey) {
      toggleColliders(false);
    }

    if (!rightPrimary && previousNoclipKey) {
      toggleColliders(true);
    }

    previousNoclipKey = rightPrimary;
  }

  function toggleColliders(enabled) {
    const meshColliders = Object.method("FindObjectsOfType").inflate(MeshCollider).invoke();

    for (let i = 0; i < meshColliders.length; i++) {
      const meshCollider = meshColliders.get(i);
      meshCollider.method("set_enabled").invoke(enabled);
    }
  }

  //#region LongArms

  function LongArms() {
    const playerTransform = GameObject.method("Find").invoke(Il2Cpp.string("Gorilla Rig")).method("get_transform").invoke();
    playerTransform.method("set_localScale").invoke([1.3, 1.3, 1.5]);
}

 //#endregion

  //#endregion

  //#endregion

  //#region Misc

  function SpoofID(): string {


    const numbers = Math.floor(1000 + Math.random() * 9000);


    return `Modded${numbers}`;


  }





  function spoofID() {


    const localPlayer = PhotonNetwork


      .method("get_LocalPlayer")


      .invoke();





    if (!localPlayer) return;





    const spoofedID = SpoofID();





    localPlayer


      .method("set_UserId")


      .invoke(Il2Cpp.string(spoofedID));





    console.log("[SpoofID]", spoofedID);


  }

  function OpenStaff() {
    const AllBoxColliders = Object.method("FindObjectsOfType").inflate(BoxCollider).invoke();
    for (let i = 0; i < AllBoxColliders.length; i++) {
      const Colid = AllBoxColliders.get(i);
      if (Colid.method("get_name").invoke().toString().includes("Cube")) {
        Colid.method("set_enabled").invoke(false);
      }
    }

    const objectsToDestroy = [
      "miroorcolideryeee",
      "hahahahahhahahhaheheheh",
      "AFJHDSUFHSDIUHHDSIUFHSIDOOR",
      "thingcol",
      "Cube (5)", "Plane", "Cube (9)", "Plane (1)", "Cube (3)", "Cube (4)", "Cube (6)",
      "Plane (2)", "Plane (3)", "Cube (7)", "Plane (5)", "Cube (12)", "Plane (4)", "Cube (10)",
      "Plane (6)", "Plane (7)", "Plane (9)", "Plane (8)", "Plane (10)", "Cube (11)", "Plane (11)",
      "Plane (9)",
      "Cube (8)", "Plane (12)", "Plane (13)", "Plane (14)", "Plane (15)", "Plane (16)",
      "Plane (17)", "Plane (18)", "Plane (19)", "Plane (20)", "Cube (13)"
    ];

    for (let i = 0; i < objectsToDestroy.length; i++) {
      Destroy(GameObject.method("Find").invoke(Il2Cpp.string(objectsToDestroy[i])));
    }
    PlayfabPatcher();
  }

  //#endregion

  //#region OP

  function RigSpam() {
  if (rightGrab) {
    const now = Date.now();
    if (now - lastRunTime >= 100) {  // fixed: was 0.1, should be 100ms
      lastRunTime = now;

      try {
        const clonedrig = PhotonNetwork.method("Instantiate", 5).invoke(
          Il2Cpp.string("photonvr/OnlinePlayerRig"),
          getTransform(headCollider).method("get_position").invoke(),
          identityQuaternion,
          0,
          NULL
        );

        if (clonedrig === null || clonedrig.isNull()) return;

        const components = clonedrig.method("GetComponents", 1).inflate(Component).invoke();
        if (components === null || components.isNull()) return;

        for (let i = 0; i < components.length; i++) {
          try {
            const component = components.get(i);
            if (component === null || component.isNull()) continue;

            const typeObj = component.method("GetType", 0).invoke();
            if (typeObj === null || typeObj.isNull()) continue;

            const nameObj = typeObj.method("get_Name").invoke();
            if (nameObj === null || nameObj.isNull()) continue;

            if (nameObj.toString().includes("PhotonVRPlayer")) {
              setTimeout(function () {
                try {
                  Destroy(component);
                } catch (e) {
                  console.log(`[WARN] Destroy component failed: ${e}`);
                }
              }, 500);
            }
          } catch (e) {
            console.log(`[WARN] Component[${i}] skipped: ${e}`);
          }
        }
      } catch (e) {
        console.log(`[WARN] RigSpam failed: ${e}`);
      }

      sendAllOutgoing();
    }
  }
}

function SpawnSpazRig(): void {
  if (!rightGrab) return;

  const now: number = Date.now();
  if (now - lastRunTime < 100) return;
  lastRunTime = now;

  try {
    const clonedRig = PhotonNetwork.method("Instantiate", 5).invoke(
      Il2Cpp.string("photonvr/OnlinePlayerRig"),
      getTransform(headCollider).method("get_position").invoke(),
      identityQuaternion,
      0,
      NULL
    );
    if (clonedRig === null || clonedRig.isNull()) return;

const headTransforms = clonedRig
  .method("GetComponentsInChildren", 1)
  .inflate(getTransform)
  .invoke();

    if (headTransforms === null || headTransforms.isNull()) return;

    let headObj: any = null;
    for (let i: number = 0; i < headTransforms.length; i++) {
      try {
        const t: any = headTransforms.get(i);
        if (t === null || t.isNull()) continue;
        const nameObj: any = t.method("get_name").invoke();
        if (nameObj === null || nameObj.isNull()) continue;
        if (nameObj.toString() === "Head") {
          headObj = t;
          break;
        }
      } catch (e) {
        console.log(`[WARN] Transform[${i}] skipped: ${e}`);
      }
    }

    if (headObj === null) {
      console.log("[WARN] Head transform not found on cloned rig");
      return;
    }

    let ticks: number = 0;
    const maxTicks: number = 20;
    const spazInterval: ReturnType<typeof setInterval> = setInterval(() => {
      try {
        if (ticks >= maxTicks) {
          clearInterval(spazInterval);
          return;
        }

        const rx: number = (Math.random() - 0.5) * 60;
        const ry: number = (Math.random() - 0.5) * 60;
        const rz: number = (Math.random() - 0.5) * 20;

        const euler: any = Il2Cpp.object("UnityEngine.Vector3");
        euler.field("x").value = rx;
        euler.field("y").value = ry;
        euler.field("z").value = rz;

        const newRot: any = Quaternion.method("Euler", 1).invoke(euler);

        headObj.method("set_localRotation").invoke(newRot);

        const pos: any = headObj.method("get_localPosition").invoke();
        const nx: number = pos.field("x").value + (Math.random() - 0.5) * 0.1;
        const ny: number = pos.field("y").value + (Math.random() - 0.5) * 0.1;
        const nz: number = pos.field("z").value + (Math.random() - 0.5) * 0.1;

        const newPos: any = Il2Cpp.object("UnityEngine.Vector3");
        newPos.field("x").value = nx;
        newPos.field("y").value = ny;
        newPos.field("z").value = nz;

        headObj.method("set_localPosition").invoke(newPos);

        ticks++;
      } catch (e) {
        console.log(`[WARN] Spaz tick failed: ${e}`);
        clearInterval(spazInterval);
      }
    }, 50);

    sendAllOutgoing();
  } catch (e) {
    console.log(`[WARN] SpawnSpazRig failed: ${e}`);
  }
}

  function RigGun() {
    if (rightGrab) {
      const gunData = renderGun();
      const gunPointer = gunData.gunPointer;

      if (rightTrigger) {
        const pos = getTransform(gunPointer).method("get_position").invoke()
        const playerSpawned = PhotonNetwork.method("Instantiate", 5).invoke(Il2Cpp.string("photonvr/OnlinePlayerRig"), pos, identityQuaternion, 0, NULL);

        const components = playerSpawned.method("GetComponents", 1).inflate(Component).invoke();

        for (let i = 0; i < components.length; i++) {
          const component = components.get(i);
          const name = component.method("GetType", 0).invoke().method("get_Name").invoke().toString();

          if (name.includes("PhotonVRPlayer")) {
            Destroy(component);
          }
        }
        sendAllOutgoing()
      };;
    }
  }

function BugRigGun() {
  if (!rightGrab) return;

  const gunData = renderGun();
  const gunPointer = gunData.gunPointer;

  if (!rightTrigger) return;

  const pos = getTransform(gunPointer)
    .method("get_position")
    .invoke();

  const zSpawned = PhotonNetwork.method("Instantiate", 5).invoke(
    Il2Cpp.string("photonvr/OnlinePlayerRig"),
    pos,
    identityQuaternion,
    0,
    NULL
  );

  sendAllOutgoing();

  const color = {
    r: Math.random(),
    g: Math.random(),
    b: Math.random(),
    a: 1
  };

  PhotonVRManager.method("SetColour").invoke([
    color.r,
    color.g,
    color.b,
    color.a
  ]);
}

  function ZombGun() {
    if (rightGrab) {
      const gunData = renderGun();
      const gunPointer = gunData.gunPointer;

      if (rightTrigger) {
        const pos = getTransform(gunPointer).method("get_position").invoke()
        const zSpawned = PhotonNetwork.method("Instantiate", 5).invoke(Il2Cpp.string("photonvr/zomb"), pos, identityQuaternion, 0, NULL);
        const z2Spawned = PhotonNetwork.method("Instantiate", 5).invoke(Il2Cpp.string("photonvr/zomb2"), pos, identityQuaternion, 0, NULL);
        sendAllOutgoing()
      };;
    }
  }

  function PrefabGun(spawnId: string) {
    if (rightGrab) {
      const gunData = renderGun();
      if (rightTrigger) {
        const pos = getTransform(gunData.gunPointer).method("get_position").invoke()
        PhotonNetwork.method("Instantiate", 5).invoke(Il2Cpp.string(spawnId), pos, identityQuaternion, 0, NULL);
        sendAllOutgoing()
      }
    }
  }

  function DestroyGun() {
    if (rightGrab) {
      const gunData = renderGun();
      if (rightTrigger) {
        const hit = gunData.ray;
        if (hit != null) {
          const hitObj = hit.method("get_transform").invoke().method("get_gameObject").invoke();
          const pv = hitObj.method("GetComponentInParent", 1).inflate(PhotonViewClass).invoke();
          if (pv != null) {
            const owner = pv.method("get_Owner").invoke();
            if (owner != null) {
              PhotonNetwork.method("SetMasterClient").invoke(PhotonNetwork.method("get_LocalPlayer").invoke());
              PhotonNetwork.method("DestroyPlayerObjects").invoke(owner);
              sendAllOutgoing();
            }
          }
        }
      }
    }
  }

  function ZombieCrashAll() {
    let zcCount = 0;
    const zcMax = 40;
    const zcInterval = setInterval(() => {
      try {
        for (let i = 0; i < 10; i++) {
          const offset = [
            (Math.random() * 6) - 3,
            (Math.random() * 4),
            (Math.random() * 6) - 3
          ];
          const pos = Vector3.method("op_Addition").invoke(
            GorillaTagger.field("headCollider").value.method("get_transform").invoke().method("get_position").invoke(),
            offset
          );
          PhotonNetwork.method("Instantiate", 5).invoke(Il2Cpp.string("PhotonVR/zomb"), pos, identityQuaternion, 0, NULL);
          PhotonNetwork.method("Instantiate", 5).invoke(Il2Cpp.string("PhotonVR/zomb2"), pos, identityQuaternion, 0, NULL);
        }
        sendAllOutgoing();
        zcCount++;
        if (zcCount >= zcMax) clearInterval(zcInterval);
      } catch (e) {
        console.log("[WARN] ZombieCrashAll tick: " + e);
        clearInterval(zcInterval);
      }
    }, 40);
  }

  function FixRig() {
      const thingforlag = PhotonNetwork.method("Instantiate", 5).invoke(Il2Cpp.string("photonvr/OnlinePlayerRig"), [1.0, 1.0, 1.0], identityQuaternion, 0, NULL)
    sendAllOutgoing()
  }



  function FlingGun() {
    if (rightGrab) {
      const gunData = renderGun();
      const gunPointer = gunData.gunPointer;

      if (rightTrigger) {
        const pos = getTransform(gunPointer).method("get_position").invoke()
        const zSpawned = PhotonNetwork.method("Instantiate", 5).invoke(Il2Cpp.string("SmallAsteroid"), pos, identityQuaternion, 0, NULL);
        sendAllOutgoing()
      };;
    }
  }

  function LagAll() {
    let lagCount = 0;
    const lagMax = 100;
    const lagInterval = setInterval(() => {
      try {
        for (let i = 0; i < 10; i++) {
          const pos = [
            (Math.random() * 200) - 100,
            (Math.random() * 100) + 20,
            (Math.random() * 200) - 100
          ];
          PhotonNetwork.method("Instantiate", 5).invoke(Il2Cpp.string("PhotonVR/OnlinePlayerRig"), pos, identityQuaternion, 0, NULL);
          PhotonNetwork.method("Instantiate", 5).invoke(Il2Cpp.string("PhotonVR/zomb"), pos, identityQuaternion, 0, NULL);
        }
        sendAllOutgoing();
        lagCount++;
        if (lagCount >= lagMax) clearInterval(lagInterval);
      } catch (e) {
        console.log("[WARN] LagAll tick: " + e);
        clearInterval(lagInterval);
      }
    }, 50);
  }

  function CrashAll() {
    let crashCount = 0;
    const crashMax = 80;
    const crashInterval = setInterval(() => {
      try {
        for (let i = 0; i < 15; i++) {
          const pos = [
            (Math.random() * 300) - 150,
            (Math.random() * 150),
            (Math.random() * 300) - 150
          ];
          PhotonNetwork.method("Instantiate", 5).invoke(Il2Cpp.string("PhotonVR/OnlinePlayerRig"), pos, identityQuaternion, 0, NULL);
          PhotonNetwork.method("Instantiate", 5).invoke(Il2Cpp.string("PhotonVR/zomb"), pos, identityQuaternion, 0, NULL);
          PhotonNetwork.method("Instantiate", 5).invoke(Il2Cpp.string("PhotonVR/zomb2"), pos, identityQuaternion, 0, NULL);
        }
        const others = PhotonNetwork.method("get_PlayerListOthers").invoke();
        if (others && others.length > 0) {
          for (let i = 0; i < others.length; i++) {
            try {
              PhotonNetwork.method("SetMasterClient").invoke(PhotonNetwork.method("get_LocalPlayer").invoke());
              PhotonNetwork.method("DestroyPlayerObjects").invoke(others.get(i));
            } catch (_) {}
          }
        }
        sendAllOutgoing();
        crashCount++;
        if (crashCount >= crashMax) clearInterval(crashInterval);
      } catch (e) {
        console.log("[WARN] CrashAll tick: " + e);
        clearInterval(crashInterval);
      }
    }, 30);
  }

  function DestroyAll() {
    const others = PhotonNetwork.method("get_PlayerListOthers").invoke();
    if (others && others.length > 0) {
      for (let i = 0; i < others.length; i++) {
        const player = others.get(i);
        PhotonNetwork.method("SetMasterClient").invoke(PhotonNetwork.method("get_LocalPlayer").invoke())
        PhotonNetwork.method("DestroyPlayerObjects").invoke(player);
      }
    }
  }
  //#endregion

  //#endregion


  const buttons: ButtonInfo[][] = [

    [ // Home
      new ButtonInfo({
        buttonText: "Settings",
        method: () => currentCategory = 2,
        keepOn: false,
      }),
      new ButtonInfo({
        buttonText: "Movement Mods",
        method: () => currentCategory = 3,
        keepOn: false,
      }),
      new ButtonInfo({
        buttonText: "Misc Mods",
        method: () => currentCategory = 4,
        keepOn: false,
      }),
       new ButtonInfo({
        buttonText: "Rig Mods",
        method: () => currentCategory = 5,
        keepOn: false,
      }),
      new ButtonInfo({
        buttonText: "OP Mods",
        method: () => currentCategory = 6,
        keepOn: false,
      }),
      new ButtonInfo({
        buttonText: "Credits",
        method: () => currentCategory = 7,
        keepOn: false,
      }),
    ],

    [ // Menu Buttons
      new ButtonInfo({
        buttonText: "Leave",
        method: () => PhotonNetwork.method("LeaveRoom", 1).invoke(true),
        keepOn: false,
      }),

      new ButtonInfo({
        buttonText: "Home",
        method: () => {
          currentCategory = 0
          currentPage = 0
        },
        keepOn: false,
      }),
      new ButtonInfo({
        buttonText: "PreviousPage",
        method: () => {
          const lastPage = Math.ceil(buttons[currentCategory].length / 6) - 1;

          currentPage--;
          if (currentPage < 0)
            currentPage = lastPage;
        },
        keepOn: false
      }),
      new ButtonInfo({
        buttonText: "NextPage",
        method: () => {
          const lastPage = Math.ceil(buttons[currentCategory].length / 6) - 1;

          currentPage++;
          currentPage %= lastPage + 1;
        },
        keepOn: false
      })
    ],

    [ // Settings
      new ButtonInfo({
        buttonText: `Fly Speed+`,
        method: () => {
          flyspeed += 1
          reloadMenu();
        },
        keepOn: false,
      }),

      new ButtonInfo({
        buttonText: `Fly Speed-`,
        method: () => {
          flyspeed -= 1
          reloadMenu();
        },
        keepOn: false,
      }),

      new ButtonInfo({
        buttonText: "Platform Color",
        method: () => {
          plater = (plater + 1) % platColors.length;
          platColor = platColors[plater];
        },
        keepOn: false,
      }),
    ],

    [ // Movement Mods
      new ButtonInfo({
        buttonText: "Hand Fly [B]",
        method: () => {
          Fly()
        },
      }),

      new ButtonInfo({
        buttonText: "Head Fly [B]",
        method: () => {
          HeadFly()
        },
      }),

      new ButtonInfo({
        buttonText: "Platforms [G]",
        method: () => {
          Platforms()
        },
      }),

      new ButtonInfo({
        buttonText: "Sticky Platforms [G]",
        method: () => {
          StickyPlatforms()
        },
      }),

      new ButtonInfo({
        buttonText: "Toggle Gravity",
        method: () => {
          const current = rigidbody.method("get_useGravity").invoke() as boolean;
          rigidbody.method("set_useGravity").invoke(!current);
        },
        keepOn: false
      }),

      new ButtonInfo({
        buttonText: "No Clip [A]",
        method: () => {
          Noclip()
        },
      }),
    ],

    [ // Misc Mods
      new ButtonInfo({ 
      buttonText: "Wireless Fucks All Name",
       method: () => {
      PhotonNetwork.method("set_NickName").invoke(Il2Cpp.string("Wireless Fucks All Wireless Fucks All Wireless Fucks All Wireless Fucks All Wireless Fucks All Wireless Fucks All Wireless Fucks All Wireless Fucks All Wireless Fucks All Wireless Fucks All Wireless Fucks All Wireless Fucks All Wireless Fucks All Wireless Fucks All Wireless Fucks All Wireless Fucks All Wireless Fucks All Wireless Fucks All Wireless Fucks All Wireless Fucks All Wireless Fucks All Wireless Fucks All Wireless Fucks All Wireless Fucks All Wireless Fucks All Wireless Fucks All Wireless Fucks All Wireless Fucks All Wireless Fucks All Wireless Fucks All Wireless Fucks All Wireless Fucks All Wireless Fucks All Wireless Fucks All Wireless Fucks All Wireless Fucks All Wireless Fucks All Wireless Fucks All Wireless Fucks All Wireless Fucks All Wireless Fucks All Wireless Fucks All Wireless Fucks All Wireless Fucks All Wireless Fucks All Wireless Fucks All Wireless Fucks All Wireless Fucks All Wireless Fucks All Wireless Fucks All Wireless Fucks All Wireless Fucks All Wireless Fucks All Wireless Fucks All Wireless Fucks All Wireless Fucks All Wireless Fucks All Wireless Fucks All Wireless Fucks All Wireless Fucks All Wireless Fucks All Wireless Fucks All Wireless Fucks All Wireless Fucks All Wireless Fucks All Wireless Fucks All Wireless Fucks All Wireless Fucks All ")) 
     },
   }),

      new ButtonInfo({ 
      buttonText: "Bright Name",
       method: () => {
  PhotonNetwork.method("set_NickName").invoke(Il2Cpp.string("<size=999><color=#ffffff><mark=#ffffff>[[[[")) 
     },
   }),
    ],

    [ // Rig Mods
      new ButtonInfo({
        buttonText: "Fix Rig",
        method: () => {
          FixRig()
        },
  keepOn: false,
      }),

      new ButtonInfo({
        buttonText: "Ghost Rig [B]",
        method: () => {
          GhostRig()
        },
      }),

      new ButtonInfo({
        buttonText: "Invis Rig [B]",
        method: () => {
          InvisRig()
        },
      }),

new ButtonInfo({
    buttonText: "Long Arms",
    method: () => {
        const playerTransform = GameObject.method("Find").invoke(Il2Cpp.string("Gorilla Rig")).method("get_transform").invoke();
        playerTransform.method("set_localScale").invoke([1.25, 1.25, 1.25]);
    },
    keepOn: false
}),


new ButtonInfo({
    buttonText: "Normal Arms",
    method: () => {
        const playerTransform = GameObject.method("Find").invoke(Il2Cpp.string("Gorilla Rig")).method("get_transform").invoke();
        playerTransform.method("set_localScale").invoke([1, 1, 1]);
    },
    keepOn: false
}),

      new ButtonInfo({
        buttonText: "RGB",
        method: () => {
const now = Time.method("get_time").invoke();
if (now - rgbLastTime < 0.5) return;
rgbLastTime = now;
try {
    const color = getSmoothColor();

    PhotonVRManager.method("SetColour").invoke([
        color.r,
        color.g,
        color.b,
        color.a
    ]);
} catch (err) {
    console.error("rgb fail:", err);
}
        },
        keepOn: true,
      }),
    ],

    [ // OP Mods
      new ButtonInfo({
        buttonText: "Set Master",
        method: () => { PhotonNetwork.method("SetMasterClient").invoke(PhotonNetwork.method("get_LocalPlayer").invoke()) },
        keepOn: false,
      }),

      new ButtonInfo({
        buttonText: "Open Staff",
        method: () => {
          OpenStaff()
        },
        keepOn: false,
      }),
      new ButtonInfo({
        buttonText: "Spoof ID",
        method: () => {
          spoofID()
        },
        keepOn: false,
      }),
      new ButtonInfo({
        buttonText: "Rig Spam [G]",
        method: () => {
          RigSpam()
        },
        keepOn: true,
      }),
      new ButtonInfo({
        buttonText: "Rig Gun [G]",
        method: () => {
          RigGun()
        },
        keepOn: true,
      }),
      new ButtonInfo({
        buttonText: "Zomb Spawn [G]",
        method: () => {
          ZombGun()
        },
        keepOn: true,
      }),

      new ButtonInfo({
        buttonText: "Fling Gun [G]",
        method: () => {
          FlingGun()
        },
        keepOn: true,
      }),
      new ButtonInfo({
        buttonText: "Lag All",
        method: () => {
          LagAll()
        },
        keepOn: false,
      }),
      new ButtonInfo({
        buttonText: "Crash All",
        method: () => {
          CrashAll()
        },
        keepOn: false,
      }),
      new ButtonInfo({
        buttonText: "Destroy All",
        method: () => {
          DestroyAll()
        },
        keepOn: false,
      }),
      new ButtonInfo({ buttonText: "Zombie Gun [G]", method: () => PrefabGun("PhotonVR/zomb"), keepOn: true }),
      new ButtonInfo({ buttonText: "Extraction Mittens Gun [G]", method: () => PrefabGun("PhotonVR/gamemodeextraction/MittensBoss"), keepOn: true }),
      new ButtonInfo({ buttonText: "Extraction Tank Gun [G]", method: () => PrefabGun("PhotonVR/gamemodeextraction/Extraction_Tank_Enemy1"), keepOn: true }),
      new ButtonInfo({ buttonText: "Extraction Zombie Gun [G]", method: () => PrefabGun("PhotonVR/gamemodeextraction/Extraction_Zombie1"), keepOn: true }),
      new ButtonInfo({ buttonText: "Extraction Flying Gun [G]", method: () => PrefabGun("PhotonVR/gamemodeextraction/Extraction_Flying_Enemy1"), keepOn: true }),
      new ButtonInfo({ buttonText: "Extraction Runner Gun [G]", method: () => PrefabGun("PhotonVR/gamemodeextraction/Extraction_Runner_Enemy1"), keepOn: true }),
      new ButtonInfo({ buttonText: "Extraction Projectile Gun [G]", method: () => PrefabGun("PhotonVR/gamemodeextraction/attacks/Projectile"), keepOn: true }),
      new ButtonInfo({ buttonText: "Extraction MegaLaser Gun [G]", method: () => PrefabGun("PhotonVR/gamemodeextraction/attacks/MegaLaser"), keepOn: true }),
      new ButtonInfo({ buttonText: "Destroy Gun [G]", method: () => DestroyGun(), keepOn: true }),
      new ButtonInfo({ buttonText: "Zombie Crash All", method: () => ZombieCrashAll(), keepOn: false }),
    ],
[ // Credits
      new ButtonInfo({
        buttonText: "GunyahJohn",
        method: () => {
		// oil up
        },
        keepOn: false,
      }),   

      new ButtonInfo({
        buttonText: "Claude",
        method: () => {
		// oil up
        },
        keepOn: false,
      }),   
 ],

  ];

  let buttonMap: Map<string, ButtonInfo> = new Map();
  buttons.flat().forEach(button => {
    buttonMap.set(button.buttonText, button);
  });

  function getIndex(buttonText: string): ButtonInfo {
    return buttonMap.get(buttonText);
  }

  const ButtonActivation = GorillaReportButton.method("OnTriggerEnter");
  ButtonActivation.implementation = function (collider) {
    const rawName = this.method("get_name").invoke().toString();

    if (rawName.length > 1 && rawName[1] == "@") {
      if (collider.handle.equals(referenceCollider.handle)) {
        const goName = rawName.substring(2, rawName.length - 1);
        const _time = Time.method("get_time").invoke();

        if (_time > buttonClickDelay) {
          buttonClickDelay = _time + 0.2;

          const button = getIndex(goName)
          if (button) {
            if (button.keepOn) {
              button.enabled = !button.enabled;

              if (button?.enabled) {
                button.enableMethod?.();
              } else {
                button?.disableMethod?.();
              }

            } else {
              button?.method?.();
            }

            reloadMenu();
          }
        }
      }

      return;
    }

    return this.method("OnTriggerEnter").invoke(collider);
  };

  const LateUpdate = GTPlayer.method("Update");

  LateUpdate.implementation = function () {

    OVRInputHandler.update();

    leftPrimary = OVRInputHandler.leftControllerPrimaryButton
    leftSecondary = OVRInputHandler.leftControllerSecondaryButton;

    rightPrimary = OVRInputHandler.rightControllerPrimaryButton;
    rightSecondary = OVRInputHandler.rightControllerSecondaryButton;

    leftGrab = OVRInputHandler.leftGrab;
    rightGrab = OVRInputHandler.rightGrab;

    leftTrigger = OVRInputHandler.leftControllerTriggerButton;
    rightTrigger = OVRInputHandler.rightControllerTriggerButton;

    deltaTime = Time.method("get_deltaTime").invoke();
    time = Time.method("get_time").invoke();

    if (leftSecondary) {
      if (menu == null) {
        renderMenu();
      } else {
        recenterMenu();
      }
    } else {
      if (menu != null) {
        Destroy(menu);
        menu = null;
      }
    }

    if (menu == null) {
      if (reference != null) {
        Destroy(reference);
        reference = null;
      }
    } else {
      if (reference == null) {
        renderReference();
      }
    }

    try {
      if (GunPointer != null) {
        if (!(GunPointer.method("get_activeSelf").invoke())) {
          Destroy(GunPointer);
          GunPointer = null;
        }
        else
          GunPointer.method("SetActive").invoke(false);
      }

      let lineObj = GunLine.method("get_gameObject").invoke();
      if (lineObj != null) {
        if (!(lineObj.method("get_activeSelf").invoke())) {
          Destroy(lineObj);
          GunLine = null;
        }
        else
          lineObj.method("SetActive").invoke(false);
      }
    } catch { }

    buttons.flat()
      .filter(button => button.enabled)
      .forEach(button => {
        if (button.method) {
          try {
            button.method();
          } catch (error) {
            console.error(`Error executing method for button '${button.buttonText || 'unnamed'}':`, error);
            console.error('Error stack:', error.stack);
            console.error('Button object:', button);

            if (error.stack) {
              const stackLines = error.stack.split('\n');
              if (stackLines.length > 1) {
                console.error('Error occurred at:', stackLines[1].trim());
              }
            }
          }
        }
      });

    return this.method("Update").invoke();
  };
  console.log(`yo menu loaded lels have fun`);
          
}, "main");