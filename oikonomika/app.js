(() => {
  const STORAGE_KEY = "isozugio.accounts.v1";
  const euro = new Intl.NumberFormat("el-GR", {
    style: "currency",
    currency: "EUR",
  });

  const els = {
    list: document.getElementById("accountList"),
    empty: document.getElementById("emptyState"),
    totalHave: document.getElementById("totalHave"),
    totalOwe: document.getElementById("totalOwe"),
    totalNet: document.getElementById("totalNet"),
    addBtn: document.getElementById("addBtn"),
    exportBtn: document.getElementById("exportBtn"),
    importInput: document.getElementById("importInput"),
    dialog: document.getElementById("accountDialog"),
    form: document.getElementById("accountForm"),
    dialogTitle: document.getElementById("dialogTitle"),
    accountId: document.getElementById("accountId"),
    accountName: document.getElementById("accountName"),
    accountAmount: document.getElementById("accountAmount"),
    accountNote: document.getElementById("accountNote"),
    deleteBtn: document.getElementById("deleteBtn"),
    cancelBtn: document.getElementById("cancelBtn"),
    closeDialog: document.getElementById("closeDialog"),
    filters: [...document.querySelectorAll(".filter")],
  };

  let accounts = loadAccounts();
  let filter = "all";

  function uid() {
    if (crypto.randomUUID) return crypto.randomUUID();
    return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  function sampleAccounts() {
    return [
      {
        id: uid(),
        name: "Τρεχούμενος λογαριασμός",
        kind: "asset",
        amount: 2450,
        note: "Μισθοδοσία",
      },
      {
        id: uid(),
        name: "Αποταμίευση",
        kind: "asset",
        amount: 8200,
        note: "",
      },
      {
        id: uid(),
        name: "Πιστωτική κάρτα",
        kind: "liability",
        amount: 680,
        note: "Μηνιαία δόση",
      },
      {
        id: uid(),
        name: "Δάνειο αυτοκινήτου",
        kind: "liability",
        amount: 4100,
        note: "",
      },
    ];
  }

  function loadAccounts() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        const seeded = sampleAccounts();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
        return seeded;
      }
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return sampleAccounts();
      return parsed
        .filter(
          (item) =>
            item &&
            typeof item.id === "string" &&
            typeof item.name === "string" &&
            (item.kind === "asset" || item.kind === "liability") &&
            Number.isFinite(Number(item.amount))
        )
        .map((item) => ({
          id: item.id,
          name: String(item.name).slice(0, 80),
          kind: item.kind,
          amount: Math.max(0, Number(item.amount)),
          note: item.note ? String(item.note).slice(0, 120) : "",
        }));
    } catch {
      return sampleAccounts();
    }
  }

  function saveAccounts() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
  }

  function sums() {
    let have = 0;
    let owe = 0;
    for (const account of accounts) {
      if (account.kind === "asset") have += account.amount;
      else owe += account.amount;
    }
    return { have, owe, net: have - owe };
  }

  function renderTotals() {
    const { have, owe, net } = sums();
    els.totalHave.textContent = euro.format(have);
    els.totalOwe.textContent = euro.format(owe);
    els.totalNet.textContent = euro.format(net);
    els.totalNet.parentElement.classList.toggle("is-negative", net < 0);
  }

  function visibleAccounts() {
    const filtered =
      filter === "all" ? accounts : accounts.filter((a) => a.kind === filter);
    return [...filtered].sort((a, b) => {
      if (a.kind !== b.kind) return a.kind === "asset" ? -1 : 1;
      return b.amount - a.amount;
    });
  }

  function renderList() {
    const items = visibleAccounts();
    els.list.innerHTML = "";
    els.empty.hidden = items.length > 0;

    for (const account of items) {
      const li = document.createElement("li");
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "account-item";
      btn.dataset.id = account.id;
      btn.setAttribute(
        "aria-label",
        `${account.name}, ${account.kind === "asset" ? "έχω" : "χρωστάω"} ${euro.format(account.amount)}`
      );

      const badge = document.createElement("span");
      badge.className = `badge badge-${account.kind}`;
      badge.textContent = account.kind === "asset" ? "Έχω" : "Χρωστάω";

      const meta = document.createElement("div");
      meta.className = "account-meta";
      const name = document.createElement("p");
      name.className = "account-name";
      name.textContent = account.name;
      meta.appendChild(name);
      if (account.note) {
        const note = document.createElement("p");
        note.className = "account-note";
        note.textContent = account.note;
        meta.appendChild(note);
      }

      const amount = document.createElement("span");
      amount.className = `account-amount is-${account.kind}`;
      amount.textContent = euro.format(account.amount);

      btn.append(badge, meta, amount);
      btn.addEventListener("click", () => openEdit(account.id));
      li.appendChild(btn);
      els.list.appendChild(li);
    }

    renderTotals();
  }

  function selectedKind() {
    const checked = els.form.querySelector('input[name="kind"]:checked');
    return checked ? checked.value : "asset";
  }

  function setKind(kind) {
    const input = els.form.querySelector(`input[name="kind"][value="${kind}"]`);
    if (input) input.checked = true;
  }

  function openCreate() {
    els.form.reset();
    els.accountId.value = "";
    setKind("asset");
    els.dialogTitle.textContent = "Νέα εγγραφή";
    els.deleteBtn.hidden = true;
    els.dialog.showModal();
    els.accountName.focus();
  }

  function openEdit(id) {
    const account = accounts.find((item) => item.id === id);
    if (!account) return;
    els.accountId.value = account.id;
    els.accountName.value = account.name;
    els.accountAmount.value = String(account.amount);
    els.accountNote.value = account.note || "";
    setKind(account.kind);
    els.dialogTitle.textContent = "Επεξεργασία";
    els.deleteBtn.hidden = false;
    els.dialog.showModal();
    els.accountName.focus();
  }

  function closeDialog() {
    if (els.dialog.open) els.dialog.close();
  }

  function upsertFromForm(event) {
    event.preventDefault();
    const name = els.accountName.value.trim();
    const amount = Number(els.accountAmount.value);
    const note = els.accountNote.value.trim();
    const kind = selectedKind();
    const id = els.accountId.value;

    if (!name || !Number.isFinite(amount) || amount < 0) return;

    if (id) {
      accounts = accounts.map((item) =>
        item.id === id ? { ...item, name, kind, amount, note } : item
      );
    } else {
      accounts = [
        ...accounts,
        { id: uid(), name, kind, amount, note },
      ];
    }

    saveAccounts();
    renderList();
    closeDialog();
  }

  function deleteCurrent() {
    const id = els.accountId.value;
    if (!id) return;
    const account = accounts.find((item) => item.id === id);
    const label = account ? account.name : "αυτή την εγγραφή";
    if (!confirm(`Να διαγραφεί «${label}»;`)) return;
    accounts = accounts.filter((item) => item.id !== id);
    saveAccounts();
    renderList();
    closeDialog();
  }

  function exportData() {
    const payload = {
      app: "isozugio",
      version: 1,
      exportedAt: new Date().toISOString(),
      accounts,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `isozugio-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function importData(file) {
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      const list = Array.isArray(data) ? data : data.accounts;
      if (!Array.isArray(list)) throw new Error("Μη έγκυρο αρχείο");
      const cleaned = list
        .filter(
          (item) =>
            item &&
            typeof item.name === "string" &&
            (item.kind === "asset" || item.kind === "liability") &&
            Number.isFinite(Number(item.amount))
        )
        .map((item) => ({
          id: typeof item.id === "string" ? item.id : uid(),
          name: String(item.name).slice(0, 80),
          kind: item.kind,
          amount: Math.max(0, Number(item.amount)),
          note: item.note ? String(item.note).slice(0, 120) : "",
        }));
      if (!cleaned.length) throw new Error("Κενό αρχείο");
      if (!confirm(`Να αντικατασταθούν οι τρέχουσες εγγραφές με ${cleaned.length};`)) {
        return;
      }
      accounts = cleaned;
      saveAccounts();
      renderList();
    } catch {
      alert("Δεν μπόρεσα να εισάγω το αρχείο. Χρειάζεται JSON από εξαγωγή Ισοζυγίου.");
    } finally {
      els.importInput.value = "";
    }
  }

  els.addBtn.addEventListener("click", openCreate);
  els.cancelBtn.addEventListener("click", closeDialog);
  els.closeDialog.addEventListener("click", closeDialog);
  els.deleteBtn.addEventListener("click", deleteCurrent);
  els.form.addEventListener("submit", upsertFromForm);
  els.exportBtn.addEventListener("click", exportData);
  els.importInput.addEventListener("change", () => {
    const file = els.importInput.files && els.importInput.files[0];
    if (file) importData(file);
  });

  els.filters.forEach((btn) => {
    btn.addEventListener("click", () => {
      filter = btn.dataset.filter;
      els.filters.forEach((other) => {
        const active = other === btn;
        other.classList.toggle("is-active", active);
        other.setAttribute("aria-selected", active ? "true" : "false");
      });
      renderList();
    });
  });

  els.dialog.addEventListener("click", (event) => {
    if (event.target === els.dialog) closeDialog();
  });

  renderList();
})();
