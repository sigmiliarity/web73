(function bootUnity(type, buildId) {
  const report = (detail) => {
    if (parent !== window)
      parent.postMessage({ type, ...detail }, "*");
  }, fail = (message) => report({ stage: "error", message });
  report({ stage: "boot" });
  let build = null;
  try {
    build = JSON.parse(document.getElementById(buildId)?.textContent ?? "null");
  } catch {
    build = null;
  }
  const canvas = document.getElementById("unity-canvas");
  if (!build || !canvas) {
    fail("The game build is unavailable");
    return;
  }
  const script = document.createElement("script");
  script.src = build.loader;
  script.onerror = () => fail("The game loader could not be downloaded");
  script.onload = () => {
    const start = globalThis.createUnityInstance;
    if (typeof start !== "function") {
      fail("The game loader is unavailable");
      return;
    }
    const config = {
      ...build.config,
      showBanner: (message, kind) => {
        if (kind === "error")
          fail(message);
        else
          console.warn(message);
      }
    };
    let percent = -1;
    const onProgress = (progress) => {
      const next = Math.floor(progress * 100);
      if (next === percent)
        return;
      percent = next;
      report({ stage: "progress", progress: next / 100 });
    };
    Promise.resolve().then(() => start(canvas, config, onProgress)).then(() => report({ stage: "ready" }), (error) => fail(error instanceof Error ? error.message : String(error)));
  };
  document.body.append(script);
})("stellite:webport","stellite-unity-build");
