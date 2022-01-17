const MainComponent = {
	template: `
	<div class="header-container-swrapper">
  <div class="header-container">
    <div class="custom-header-bg">
      <div class="page-center">
        <div class="logo" data-i18n="title"> Candie Converter </div>
        <div class="navigation">
          <ul>
            <li>
              <select id="languageSelector" name="language">
                <option value="tr">TR</option>
                <option value="en" selected>EN</option>
              </select>
            </li>
            <li>
              <a href="#" class="button open-progress">
                <i class="fa fa-tasks" aria-hidden="true"></i>Progress </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
  <div class="body-container-wrapper">
    <div class="body-container">
      <div class="page-center">
        <span>
          <i class="fa fa-sync d-none d-lg-block  " aria-hidden="true"></i>
        </span>
		<div class="container d-none d-md-block">
		<h2 class="text-center mt-5"data-i18n="slogan">Simply convert your files</h2>
		<div class="row">
			<div class="col-md-3 mt-2">
				<div class="card purple-card">
					<div class="content">
						<h3>Total</h3>
						<p>{{files.length}}</p>
					</div>
				</div>
			</div>
			<div class="col-md-3 mt-2">
			<div class="card green-card">
				<div class="content">
					<h3>Converted</h3>
					<p>{{files.filter(file => file.status == 2).length}}</p>
				</div>
			</div>
		</div>
		   <div class="col-md-3 mt-2">
			
			  <div class="card blue-card">
			  <div class="content">
				 <h3>Enqueued</h3>
				 <p>{{files.filter(file => file.status == 1).length}}</p>
			  </div>
			 
		   </div>
		   </div>
		   <div class="col-md-3 mt-2">
			 
			  <div class="card orange-card">
			  <div class="content">
				 <h3>Failed</h3>
				 <p>{{files.filter(file => file.status == 3).length}}</p>
			  </div>
		   </div>
		   </div>
		</div>
	 </div>		
        <div class="options-container ">
          <select name="fromSelector" v-model="fromFormat" id="fromSelector">
            <option v-for="format in formats" v-bind:value="format">{{format}}</option>
          </select>
          <span data-i18n="format.to">To</span>
          <select v-model="toFormat" name="toSelector" id="toSelector">
            <option v-for="format in formats.filter(frm => !['HEIC', 'ANY'].includes(frm))" v-bind:value="format">{{format}}</option>
          </select>
        </div>
    
        <div class=" mt-2">
          <a class="btn btn-candie" id="call-to-action" v-on:click="openFileBrowser()">
            <span data-i18n="select.folder">Select files</span>
          </a>
          <a class="btn convert-files btn-candie" id="call-to-action" v-on:click="enqueueFiles()">
            <em class="fa fa-sync s" aria-hidden="true"></em>
          </a>
        </div>
        <form id="upload" method="post" action="upload.php" enctype="multipart/form-data">
          <div id="drop">
            <input type="file" multiple name="upl" class="upload-hidden" v-on:change="onFileBrowserChange($event)" />
          </div>
        </form>
        <div class="file-upload-bar">
          <div class="bar-wrapper">
            <div class="overall">
              <span data-i18n="selectedFiles">Selected files</span>
              <span class="close-button">
                <em class="fas fa-times "></em>
              </span>
              <br />
              <span data-i18n="totalFiles">Total file: </span>
              <span>
                <em id="total-file">{{files.length}}</em>
              </span>
            </div>
            <div class="individual-files">
              <ul id="selected-files-list">
                <li v-for="file in files" v-bind:id="file.name">
                  <span class="filename">
                    <i>File Name:</i>
                    <b>{{file.name}}</b>
                  </span>
                  <span class="filesize">
                    <i>File Size:</i>
                    <b>{{formatFileSize( file.size )}}</b>
                  </span>
                  <span> Status:&nbsp; <a v-bind:id="fileText(file.name)" v-if="file.status == 0" data-i18n="status.readyForConvert">{{translate("status.readyForConvert")}}</a>
                    <a v-bind:id="fileText(file.name)" v-if="file.status == 1" data-i18n="status.converting">{{translate("status.converting")}}</a>
                    <a v-bind:id="fileText(file.name)" v-if="file.status == 2" data-i18n="status.converted">{{translate("status.converted")}}</a>
                    <a v-bind:id="fileText(file.name)" v-if="file.status == 3" data-i18n="status.failed">{{translate("status.failed")}}</a>
                    <em v-bind:id="fileIcon(file.name)" class="fas fa-running text-primary" v-if="file.status == 0"></em>
                    <em v-bind:id="fileIcon(file.name)" class="fas fa-spinner fa-spin text-info" v-if="file.status == 1"></em>
                    <em v-bind:id="fileIcon(file.name)" class="fas fa-check text-success" v-if="file.status == 2"></em>
                    <em v-bind:id="fileIcon(file.name)" class="fas fa-times text-danger" v-if="file.status == 3"></em>
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div class="file-upload-bar-closed"></div>
      </div>
    </div>
  </div>
  <div class="footer-container-wrapper">
    <div class="footer-container">
      <div class="custom-footer-bg">
        <div class="page-center">
          <p>Serhat KAYA</p>
        </div>
      </div>
    </div>
  </div>
</div>
		`,
	methods: {
		enqueueFiles() {
			if (this.files.length > 0) {
				const mappedRequest = this.files.map((file) => {
					return {
						fileName: file.name,
						targetFormat: this.toFormat,
						path: file.path,
					};
				});

				this.files.forEach((file, index) => {
					this.files[index].status = 1;
				});

				$.ajax({
					contentType: "application/json",
					dataType: "json",
					async: true,
					type: "POST",
					url: "/Convert/Convert",
					data: JSON.stringify(mappedRequest),
					success: function (dt) {},
				});
			} else {
				this.messageBox("Error", $.i18n("alerts.noFilesSelected"), 2);
			}
		},
		translate(key) {
			return $.i18n(key);
		},
		formatFileSize(bytes) {
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
		},
		connectSignalr() {
			this.hub = new signalR.HubConnectionBuilder()
				.withUrl("/convertHub")
				.build();

			let self = this;
			this.hub.on("fileConverted", function (fileName) {
				const index = self.files.findIndex((fl) => fl.name == fileName);
				if (index > -1) {
					self.files[index].status = 2;
				}
			});

			this.hub.on("fileConvertFailed", function (fileName) {
				const index = self.files.findIndex((fl) => fl.name == fileName);
				if (index > -1) {
					self.files[index].status = 3;
				}
			});

			this.hub
				.start()
				.then(function () {})
				.catch(function (err) {
					return console.error(err.toString());
				});
		},
		loadLanguageFiles() {
			$.i18n()
				.load({
					en: "i18n/en.json",
					tr: "i18n/tr.json",
				})
				.done(function () {
					$("body").i18n();
				});
		},
		setInputFilters() {
			$(".upload-hidden").attr(
				"accept",
				this.fromFormat == "ANY"
					? this.getAllFormats()
					: `.${this.fromFormat}`
			);
		},
		getAllFormats() {
			let data = "";

			this.formats.forEach((format) => {
				if (format != "ANY") {
					data += `.${format},`;
				}
			});
			return data;
		},
		openFileBrowser() {
			this.setInputFilters();
			$(".upload-hidden").click();
		},
		onFileBrowserChange(e) {
			const fileBrowserFiles = [...e.target.files];
			if (fileBrowserFiles && fileBrowserFiles.length > 0) {
				this.files = [...fileBrowserFiles]
					.filter((r) =>
						this.fromFormat == "ANY"
							? true
							: r.name
									.toLowerCase()
									.includes(
										`.${this.fromFormat}`.toLowerCase()
									)
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
							status: 0,
						};
					});
				$("body").addClass("file-process-open");
			}
		},
		fileIcon(name) {
			return `${name.split(".")[0]}-status-icon`;
		},
		fileText(name) {
			return `${name.split(".")[0]}-status-text`;
		},
		messageBox(title, message, type) {
			this.hub.invoke("MessageBox", title, message, type);
		},
	},
	data() {
		return {
			formats: ["ANY", "JPG", "HEIC", "PNG", "JPEG"],
			items: [1, 2],
			files: [],
			language: "EN",
			fromFormat: "ANY",
			toFormat: "JPEG",
			$: $,
			hub: null,
		};
	},
	created() {
		this.connectSignalr();
		this.loadLanguageFiles();
	},
};
