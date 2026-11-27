// HTMLの要素を取得
const startDate = document.getElementById("start-date");
const endDate = document.getElementById("end-date");
const shiftTable = document.getElementById("shift-table");
const output = document.getElementById("output");

// 曜日と勤務時間帯
const weekdays = ["日", "月", "火", "水", "木", "金", "土"];
const slots = ["6〜9時", "9〜13時", "13〜17時", "17〜21時"];

// シフト表を生成する関数
function generateTable() {

    // 既存の表を空にする
    shiftTable.innerHTML = "";
    output.value = "";

    if (!startDate.value || !endDate.value) {
        return;
    }

    const start = new Date(startDate.value + "T00:00:00");
    const end = new Date(endDate.value + "T00:00:00");

    // 入力期間の確認
    if (end < start) {
        return;
    }
    // 提出期間を最大31日間に制限
    const limit = new Date(start);
    limit.setDate(limit.getDate() + 30);

    if (end > limit) {
        alert("提出期間は31日以内にしてください。");
        return;
    }
    // 開始日から終了日まで繰り返す
    for (
        let date = new Date(start);
        date <= end;
        date.setDate(date.getDate() + 1)
    ) {

        const row = document.createElement("tr");

        const month = date.getMonth() + 1;
        const day = date.getDate();
        const weekday = date.getDay();

        // 日付のセルを作成
        const dateCell = document.createElement("td");

        dateCell.textContent =
            `${month}/${day}（${weekdays[weekday]}）`;

        // 土日の色分け
        if (weekday === 6) {
            dateCell.classList.add("saturday");
        }

        if (weekday === 0) {
            dateCell.classList.add("sunday");
        }

        row.appendChild(dateCell);

        // 4つの時間帯のボタンを作成
        for (const slot of slots) {

            const cell = document.createElement("td");
            const button = document.createElement("button");

            button.textContent = "+";
            button.classList.add("shift-button");
            button.setAttribute("aria-label", slot);
            
            
            // ボタンを押したときの処理
            button.addEventListener("click", function () {

                // 選択状態を切り替える
                button.classList.toggle("selected");

                // ボタンの文字を変更する
                if (button.classList.contains("selected")) {
                    button.textContent = "✓";
                } else {
                    button.textContent = "+";
                }
                  generateMessage();
            });            


            cell.appendChild(button);
            row.appendChild(cell);
        }

        shiftTable.appendChild(row);
    }
}

// 日付が変更されたら表を生成
startDate.addEventListener("change", generateTable);
endDate.addEventListener("change", generateTable);

// 初回表示
generateTable();
// LINE送信用の文章を生成する
function generateMessage() {

    const rows = shiftTable.querySelectorAll("tr");
    const lines = [];

    for (const row of rows) {

        // 日付を取得
        const date = row.cells[0].textContent;

        // 選択された時間帯を取得
        const selectedSlots = [];

        for (let i = 0; i < slots.length; i++) {

            const button = row.cells[i + 1]
                .querySelector("button");

            if (button.classList.contains("selected")) {
                selectedSlots.push(slots[i]);
            }
        }

        // 選択された日付だけ文章に追加
        if (selectedSlots.length > 0) {
            lines.push(
                date + "：" + selectedSlots.join("or")
            );
        }
    }

    // 何も選択されていない場合
    if (lines.length === 0) {
        output.value = "";
        return;
    }

    // 終了日を取得
    const end = new Date(endDate.value + "T00:00:00");
    const month = end.getMonth() + 1;
    const day = end.getDate();

    // 文章を完成させる
    output.value =
        `${month}月${day}日までの出勤可能な時間帯は\n` +
        lines.join("\n") +
        "\nです。\n\nよろしくお願いします。";
}
// コピーボタンの処理
const copyButton = document.getElementById("copy-button");

copyButton.addEventListener("click", async function () {

    if (output.value === "") {
        alert("時間帯を選択してください。");
        return;
    }

    try {
        await navigator.clipboard.writeText(output.value);

        copyButton.textContent = "コピーしました！";

        setTimeout(function () {
            copyButton.textContent = "文章をコピー";
        }, 2000);

    } catch (error) {
        alert("コピーできませんでした。");
    }
});

// リセットボタンの処理
const resetButton = document.getElementById("reset-button");

resetButton.addEventListener("click", function () {

    const buttons = shiftTable.querySelectorAll(".shift-button");

    for (const button of buttons) {
        button.classList.remove("selected");
        button.textContent = "+";
    }

    generateMessage();
});

// 入力内容を保存する
function saveData() {

    const buttons = shiftTable.querySelectorAll(".shift-button");

    const selections = Array.from(buttons).map(button =>
        button.classList.contains("selected")
    );

    const data = {
        start: startDate.value,
        end: endDate.value,
        selections: selections
    };

    localStorage.setItem("shiftMaker", JSON.stringify(data));
}

// 保存した内容を復元する
function loadData() {

    const saved = localStorage.getItem("shiftMaker");

    if (!saved) {
        return;
    }

    const data = JSON.parse(saved);

    startDate.value = data.start;
    endDate.value = data.end;

    generateTable();

    const buttons = shiftTable.querySelectorAll(".shift-button");

    buttons.forEach((button, index) => {

        if (data.selections[index]) {
            button.classList.add("selected");
            button.textContent = "✓";
        }
    });

    generateMessage();
}

// 時間帯を選択したときに保存
shiftTable.addEventListener("click", saveData);

// 日付を変更したときに保存
startDate.addEventListener("change", saveData);
endDate.addEventListener("change", saveData);

// リセットしたときに保存
resetButton.addEventListener("click", saveData);

// ページを開いたときに復元
loadData();