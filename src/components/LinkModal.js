// LinkModal.js

class LinkModal {
  constructor() {
    this.linkModal = document.createElement("div");
    this.linkModal.className = "modal";
    this.linkModal.style.display = "none";
    this.linkModal.innerHTML = `
        <div class="modal-content">
          <span class="close">&times;</span>  
          <label for="weight">Weight (-1 to 1):</label>
          <input type="number" id="weightInput" min="-1" max="1" step="0.01" placeholder="Enter weight">
  
          <label for="trainableToggle">Trainable:</label>
          <label class="switch">
            <input type="checkbox" id="trainableToggle">
            <span class="slider round"></span>
          </label>
        </div>
      `;
    document.body.appendChild(this.linkModal);

    // Apply styles for modal and toggle switch
    this.addStyles();

    // Assign elements
    this.weightInput = this.linkModal.querySelector("#weightInput");
    this.trainableToggle = this.linkModal.querySelector("#trainableToggle");
    this.closeModal = this.linkModal.querySelector(".close");

    // Bind event listeners
    this.closeModal.onclick = () => (this.linkModal.style.display = "none");

    window.onclick = (event) => {
      if (event.target === this.linkModal) {
        this.linkModal.style.display = "none";
      }
    };

    this.updateCallback = null;
  }

  // Show modal with specific link data
  show(link, updateCallback) {
    this.weightInput.value = link.get("weight") || "";
    this.trainableToggle.checked = link.get("trainable") || false;
    this.linkModal.style.display = "block";

    // Store the update callback function to use when autosaving
    this.updateCallback = updateCallback;

    // Add autosave listeners
    this.weightInput.oninput = this.handleAutosave.bind(this);
    this.trainableToggle.onchange = this.handleAutosave.bind(this);
  }

  // Handle autosave
  handleAutosave() {
    let weightValue = parseFloat(this.weightInput.value);

    // Validate weight is within -1 to 1
    if (weightValue < -1) {
      weightValue = -1;
      this.weightInput.value = weightValue;
    } else if (weightValue > 1) {
      weightValue = 1;
      this.weightInput.value = weightValue;
    }

    if (this.updateCallback) {
      this.updateCallback({
        weight: weightValue,
        trainable: this.trainableToggle.checked,
      });
    }
  }

  // Add modal and switch styles
  addStyles() {
    const style = document.createElement("style");
    style.textContent = `
        .modal {
          display: none;
          position: fixed;
          z-index: 1;
          padding-top: 100px;
          left: 0;
          top: 0;
          width: 100%;
          height: 100%;
          overflow: auto;
          background-color: rgba(0, 0, 0, 0.4);
        }
  
        .modal-content {
          background-color: #fefefe;
          margin: auto;
          padding: 15px;
          border: 1px solid #888;
          width: 150px;
          height: 150px;
          border-radius: 8px;
          font-size: 14px;
        }
  
        .close {
          color: #aaa;
          float: right;
          font-size: 22px;
          font-weight: bold;
          cursor: pointer;
        }
  
        .close:hover,
        .close:focus {
          color: black;
          text-decoration: none;
        }
  
        h3 {
          margin-top: 0;
          font-size: 16px;
        }
  
        label {
          display: block;
          margin: 8px 0 4px;
          font-size: 13px;
        }
  
        input[type="number"] {
          margin-bottom: 10px;
          width: 100%;
          padding: 4px;
          font-size: 13px;
          border-radius: 4px;
          border: 1px solid #ccc;
        }
  
        .switch {
          position: relative;
          display: inline-block;
          width: 34px;
          height: 18px;
          justify-content: center;
        }
  
        .switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }
  
        .slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: #ccc;
          transition: 0.4s;
          border-radius: 18px;
          horizontal-align: middle;

        }
  
        .slider:before {
          position: absolute;
          content: "";
          height: 12px;
          width: 12px;
          left: 3px;
          bottom: 3px;
          background-color: white;
          transition: 0.4s;
          border-radius: 50%;
        }
  
        input:checked + .slider {
          background-color: #60396E;
        }
  
        input:checked + .slider:before {
          transform: translateX(16px);
        }
      `;
    document.head.appendChild(style);
  }
}

export default LinkModal;
