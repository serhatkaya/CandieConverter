$(function () {
  "use strict";
  let files = [];
  let list = $("#selected-files-list");
  let totalFile = $("#total-file");
  var languageSelector = $("#languageSelector");
  var fromSelector = $("#fromSelector");
  var toSelector = $("#toSelector");
  var body = $("body");

  var fromFormat = "ANY";
  var toFormat = "JPEG";
  $.i18n()
    .load({
      en: "i18n/en.json",
      tr: "i18n/tr.json",
    })
    .done(function () {
      body.i18n();
    });

  $("#languageSelector").on("change", function () {
    const lang = languageSelector.find(":selected").val();
    $.i18n().locale = lang;
    body.i18n();
  });

  function loadFiles(fileList) {
    const mappedfiles = [...fileList]
      .filter((r) =>
        fromFormat == "ANY"
          ? true
          : r.name.toLowerCase().includes(`.${fromFormat}`.toLowerCase())
      )
      .map((x) => {
        return {
          lastModified: x.lastModified,
          lastModifiedDate: x.lastModifiedDate,
          name: x.name,
          path: x.path,
          size: x.size,
          type: x.type,
          webkitRelativePath: x.webkitRelativePath,
        };
      });

    files = mappedfiles;
    $.each(files, (i, file) => {
      list.append(`
          <li id="${file.name}">
              <span class="filename"><i>File Name:</i><b>${file.name}</b></span>
              <span class="filesize"><i>File Size:</i><b>${formatFileSize(
                file.size
              )}</b></span>
              <span>
              Status:&nbsp;<text id="${fileText(
                file.name
              )}" data-i18n="status.readyForConvert">${$.i18n(
        "status.readyForConvert"
      )}</text>
              <em id="${fileIcon(file.name)}" class="fas fa-running"></em>
              </span>    
          </li>
          `);
    });

    totalFile.html(files.length);
  }

  function convertFiles() {
    if (files.length > 0) {
      files.forEach((r) => convertQueue.enqueue(r));
      toggleConvertButtonStatus();
      processQueue();
    } else {
      alert($.i18n("alerts.noFilesSelected"));
    }
  }

  function fileIcon(name) {
    return `${name.split(".")[0]}-status-icon`;
  }

  function fileText(name) {
    return `${name.split(".")[0]}-status-text`;
  }

  let convertQueue = new Queue();
  function processQueue() {
    while (!convertQueue.isEmpty()) {
      const file = convertQueue.dequeue();
      $(`#${fileText(file.name)}`)
        .html($.i18n("status.converting"))
        .attr("data-i18n", "status.converting");

      $(`#${fileIcon(file.name)}`)
        .removeClass()
        .addClass("fas fa-spinner fa-spin");

      $.ajax({
        contentType: "application/json",
        dataType: "json",
        async: true,
        type: "POST",
        url: "/Convert/Convert",
        data: JSON.stringify({
          fileName: file.name,
          targetFormat: toFormat,
          path: file.path,
        }),
        success: function (dt) {
          $(`#${fileText(dt.fileName)}`)
            .html($.i18n("status.converted"))
            .attr("data-i18n", "status.converted");
          $(`#${fileIcon(dt.fileName)}`)
            .removeClass()
            .addClass("fas fa-check");
        },
      });
    }

    if (convertQueue.isEmpty()) {
      toggleButtonStatus(true);
    }
  }

  function formatFileSize(bytes) {
    if (typeof bytes !== "number") {
      return "";
    }

    if (bytes >= 1000000000) {
      return (bytes / 1000000000).toFixed(2) + " GB";
    }

    if (bytes >= 1000000) {
      return (bytes / 1000000).toFixed(2) + " MB";
    }

    return (bytes / 1000).toFixed(2) + " KB";
  }

  $("#call-to-action").on("click", function () {
    // $("#call-to-action").addClass("upload--loading");
    setFormatOfInput();
    $(".upload-hidden").click();
  });

  $(".upload-hidden").on("change", function (e) {
    $("#call-to-action").removeClass("upload--loading");
    $("body").addClass("file-process-open");
    loadFiles($(this).prop("files"));
  });

  $(".open-progress").on("click", function () {
    $("body").toggleClass("file-process-open");
  });

  $(".close-button").on("click", function () {
    $("body").toggleClass("file-process-open");
  });

  $(".file-upload-bar").on("click", function (event) {
    event.stopPropagation();
  });

  var formats = ["ANY", "JPG", "HEIC", "PNG", "JPEG"];
  setFormatOfInput();
  function setFormatOfInput() {
    $(".upload-hidden").attr(
      "accept",
      fromFormat == "ANY" ? getAllFormats() : `.${fromFormat}`
    );
  }

  function getAllFormats() {
    let data = "";

    formats.forEach((format) => {
      if (format != "ANY") {
        data += `.${format},`;
      }
    });
    return data;
  }

  $.each(formats, function (i, format) {
    fromSelector.append(
      $("<option>", {
        value: format,
        text: format,
      })
    );

    if (!["ANY", "HEIC"].includes(format)) {
      toSelector.append(
        $("<option>", {
          value: format,
          text: format,
        })
      );
    }
  });

  fromSelector.on("change", function () {
    fromFormat = $(this).val();
  });

  toSelector.on("change", function () {
    toFormat = $(this).val();
  });

  $(".convert-files").on("click", function () {
    const checkDisabled = $(this).attr("disabled");
    if (!checkDisabled) {
      convertFiles();
    }
  });

  function toggleConvertButtonStatus() {
    $(".convert-files").attr("disabled", function (index, attr) {
      return attr ? null : true;
    });
  }
  function toggleButtonStatus(enable) {
    if (enable) {
      $(".convert-files").attr("disabled", null);
    } else {
      $(".convert-files").attr("disabled", true);
    }
  }
});
