const NOTES_LOCAL_STORAGE_KEY = "notes";

class Note {
    constructor(title="", content = "", color = "white") {
        this.uuid = crypto.randomUUID();
        this.title = title;
        this.content = content;
        this.color = color;
    }

    /**
     * This function creates a Note object from an object. This is useful for converting the response from JSON.parse
     * into a usable Note object.
     * @param {Object} obj - The object to convert to a Note object.
     * @returns {Note} A Note with the properties of the given object.
     * @example
     *   Note.fromObj({uuid: "00000000-0000-4000-0000-000000000000", title: "Note 1", content: "Some text", color: "red"})
     */
    static fromObj(obj) {
        return Object.assign(new Note(), obj);
    }
}

/**
 * This function gets notes from local storage
 * @returns {Array.<Note>} An array of Note objects.
 */
function getNotes() {
    const jsonObjs = localStorage.getItem(NOTES_LOCAL_STORAGE_KEY) || "[]";
    const objs = JSON.parse(jsonObjs);
    return objs.map((obj) => Note.fromObj(obj));
}

/**
 * This function saves an array of Note objects to local storage
 * @param {Array.<Note>} notes - The notes array that we want to save to local storage.
 */
function saveNotes(notes) {
    const jsonNotes = JSON.stringify(notes);
    localStorage.setItem(NOTES_LOCAL_STORAGE_KEY, jsonNotes);
}

/**
 * This function saves a new note to local storage
 * @param {Note} note - The note to add to the list of notes.
 */
function saveNewNote(note) {
    const notes = getNotes();
    notes.push(note);
    saveNotes(notes);
}

/**
 * This function removes any note referenced by the given uuid from local storage and updates the visible notes.
 * @param {string} uuid - The uuid of the note to remove.
 */
function deleteNote(uuid) {
    const notes = getNotes();
    const newNotes = notes.filter((note) => note.uuid !== uuid);
    saveNotes(newNotes);
    updateDisplayedNotes();
}

/**
 * This function delete all notes from the page.
 */
function deleteAllNotes() {
    saveNotes([]);
    updateDisplayedNotes();
}

/**
 * This function displays the notes (filtered by search text) on the page
 */
function updateDisplayedNotes() {
    const searchText = document.getElementById("searchTxt").value;
    const notesContainerEle = document.getElementById("notes");
    const notes = getNotes();
    const matchedNotes = notes.filter((note) => note.title.includes(searchText.toLowerCase()) || note.content.includes(searchText.toLowerCase()));

    if (matchedNotes.length === 0) {
        notesContainerEle.innerHTML = `<div>Nothing to show! Use "Add a Note" section above to add notes.</div>`;
    } else {
        const notesHtml = matchedNotes.map( (note) => {
            return `
                <div class="noteCard my-2 mx-2 card" style="width: 18rem; box-shadow: 0 0 10px #333; background-color: ${note.color};">
                    <div class="card-body">
                        <h5 class="card-title">${note.title}</h5>
                        <p class="card-text"> ${note.content}</p>
                        <button id="${note.uuid}"onclick="deleteNote(this.id)" class="btn btn-primary">Delete Note</button>
                    </div>
                </div>`;
        });
        notesContainerEle.innerHTML = notesHtml.join("\n");
    }
}

// Enables/disables the add button when the input field is updated
document.getElementById("txtContent").addEventListener("input", (e) => {
    const trimmedInputText = e.target.value.trim();
    document.getElementById("addBtn").disabled = trimmedInputText.length === 0;
});

// Adds a new note when the add button is clicked
document.getElementById("addBtn").addEventListener("click", (e) => {
    e.target.disabled = true;
    const title = document.getElementById("inpTitle").value.trim() || "Untitled";
    const content = document.getElementById("txtContent").value;
    const color = document.getElementById("selectorColor").value;
    const note = new Note(title, content, color);
    saveNewNote(note);
    document.getElementById("txtContent").value = "";
    updateDisplayedNotes();
});

// Updates the visible notes when the search field is updated
document.getElementById("searchTxt").addEventListener("input", () => {
    updateDisplayedNotes();
});

/** 
 * Deletes all notes when the delete all button is triggered.
 * Confirms with a prompt that requires to enter the word delete 
 * If failed, alerts with the error message.
 */
document.getElementById('delAllBtn').addEventListener('click', () => {
    const isDelete = prompt("Alert! You are about to remove all your notes. Type in \"delete\" to confirm.") === 'delete';
    if(isDelete) return deleteAllNotes();

    alert("Couldn't proceed. WARNING: case-sensitive");
});

console.log("Welcome to notes app. This is app.js");
updateDisplayedNotes();  // Initialize with saved notes
