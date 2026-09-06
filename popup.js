const toggleBtn = document.getElementById("toggleBtn");
const toggleText = document.getElementById("toggleText");
const statusLabel = document.getElementById("statusLabel");
const enabledCount = document.getElementById("enabledCount");
const totalCount = document.getElementById("totalCount");
const savedCount = document.getElementById("savedCount");
const errorBox = document.getElementById("error");
const hint = document.getElementById("hint");

function showError(message) {
  errorBox.hidden = !message;
  errorBox.textContent = message || "";
}

function render(status) {
  enabledCount.textContent = status.enabledCount;
  totalCount.textContent = status.totalCount;
  savedCount.textContent = status.savedCount;

  toggleBtn.disabled = false;
  toggleBtn.classList.toggle("stopped", status.stopped);
  toggleBtn.classList.toggle("running", !status.stopped);

  if (status.stopped) {
    toggleText.textContent = "Start";
    statusLabel.textContent = "All other extensions are stopped";
    hint.textContent = "Press Start to turn back on the extensions that were enabled before.";
  } else {
    toggleText.textContent = "Stop";
    statusLabel.textContent = "Extensions are running";
    hint.textContent = "Press Stop to disable every other extension. This add-on stays on.";
  }
}

async function refresh() {
  showError("");
  const status = await browser.runtime.sendMessage({ type: "GET_STATUS" });
  render(status);
}

toggleBtn.addEventListener("click", async () => {
  toggleBtn.disabled = true;
  showError("");
  try {
    const status = await browser.runtime.sendMessage({ type: "GET_STATUS" });
    const result = status.stopped
      ? await browser.runtime.sendMessage({ type: "START" })
      : await browser.runtime.sendMessage({ type: "STOP" });

    if (!result || !result.ok) {
      throw new Error("Toggle failed");
    }
    await refresh();
  } catch (err) {
    showError(err.message || "Could not toggle extensions.");
    toggleBtn.disabled = false;
  }
});

refresh().catch((err) => {
  showError(err.message || "Could not read extension list. Grant management permission.");
});
