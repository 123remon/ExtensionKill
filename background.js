const STATE_KEY = "killSwitchState";

const defaultState = {
  stopped: false,
  savedIds: []
};

async function getState() {
  const data = await browser.storage.local.get(STATE_KEY);
  return data[STATE_KEY] || defaultState;
}

async function setState(state) {
  await browser.storage.local.set({ [STATE_KEY]: state });
  await updateBadge(state.stopped);
}

async function updateBadge(stopped) {
  if (stopped) {
    await browser.browserAction.setBadgeText({ text: "OFF" });
    await browser.browserAction.setBadgeBackgroundColor({ color: "#c0392b" });
    await browser.browserAction.setTitle({ title: "Extension Kill Switch — stopped" });
  } else {
    await browser.browserAction.setBadgeText({ text: "" });
    await browser.browserAction.setTitle({ title: "Extension Kill Switch — running" });
  }
}

function isSelf(ext) {
  return ext.id === browser.runtime.id;
}

async function listUserExtensions() {
  const all = await browser.management.getAll();
  return all.filter((ext) => {
    if (isSelf(ext)) return false;
    if (ext.type !== "extension") return false;
    return true;
  });
}

async function stopAllExtensions() {
  const current = await getState();
  if (current.stopped) {
    return { ok: true, already: true, count: current.savedIds.length };
  }

  const extensions = await listUserExtensions();
  const enabledIds = extensions.filter((ext) => ext.enabled).map((ext) => ext.id);

  for (const id of enabledIds) {
    try {
      await browser.management.setEnabled(id, false);
    } catch (err) {
      console.warn("Could not disable", id, err);
    }
  }

  await setState({
    stopped: true,
    savedIds: enabledIds
  });

  return { ok: true, already: false, count: enabledIds.length };
}

async function startSavedExtensions() {
  const current = await getState();
  if (!current.stopped) {
    return { ok: true, already: true, count: 0 };
  }

  let restored = 0;
  for (const id of current.savedIds) {
    try {
      await browser.management.setEnabled(id, true);
      restored += 1;
    } catch (err) {
      console.warn("Could not enable", id, err);
    }
  }

  await setState({
    stopped: false,
    savedIds: []
  });

  return { ok: true, already: false, count: restored };
}

browser.runtime.onMessage.addListener((message) => {
  if (message.type === "GET_STATUS") {
    return getState().then(async (state) => {
      const extensions = await listUserExtensions();
      return {
        stopped: state.stopped,
        savedCount: state.savedIds.length,
        enabledCount: extensions.filter((ext) => ext.enabled).length,
        totalCount: extensions.length
      };
    });
  }

  if (message.type === "STOP") {
    return stopAllExtensions();
  }

  if (message.type === "START") {
    return startSavedExtensions();
  }

  return undefined;
});

getState().then((state) => updateBadge(state.stopped));
