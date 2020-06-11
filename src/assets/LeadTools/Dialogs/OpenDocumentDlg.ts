﻿//import { DriveHelper } from "../DriveHelper/DriveHelper";

// *************************************************************
// Copyright (c) 1991-2019 LEAD Technologies, Inc.
// All Rights Reserved.
// *************************************************************
export module HTML5Demos {

   export module Dialogs {
      //Annotations Load Options 
      enum AnnotationsLoadOption {
         none,
         embedded,
         external
      }

      enum FileUrlLoadOption {
         sample,
         url
      }

      // Custom event args for the UploadDocumentDlg load event
      export class UploadDocumentEventArgs {
         public documentFile: File;
         public annotationFile: File;
         public loadEmbeddedAnnotations: boolean = false;
         public firstPage: number;
         public lastPage: number;
      }

      // Custom event args for the OpenDocumentFromUrlDlg load event
      export class OpenDocumentFromUrlEventArgs {
         public fileUrl: string = "";
         public annotationsUrl: string = "";
         public loadEmbeddedAnnotations: boolean = false;
         public firstPage: number;
         public lastPage: number;
      }

      // Custom event args for the OpenDocumentFromUrlDlg load event
      export class OpenFromDocumentStorageEventArgs {
         public documentFile: any; // DriveHelper.DriveFile;
         public annotationsFile: any; //DriveHelper.DriveFile;
         public loadEmbeddedAnnotations: boolean = false;
         public firstPage: number;
         public lastPage: number;
      }

      //Custom event args for the LoadDocumentPageRangeDlg set event
      export class LoadPageRangeEventArgs {
         public firstPage: number = 1;
         public lastPage: number = -1;
         public pageDescription: string = "All Pages"
      }

      interface UploadDocumentDlgUI<T> {
         documentFileInput: T,
         annotationsLoadOptionsRadioBtns: T,
         annotationsFileInput: T,
         uploadBtn: T,
         pageRangeBtn: T,
         pageRangeDescription: T,
         hide: T
      }

      export class UploadDocumentDlg implements lt.Demos.Dialogs.Dialog {

         public inner: lt.Demos.Dialogs.InnerDialog = null;
         private el: UploadDocumentDlgUI<string> = null;
         private pageRangeDlg: LoadDocumentPageRangeDlg = null;
         private cachedFirstPage: number = null;
         private cachedLastPage: number = null;
         
         constructor() {
            var root = $("#dlgUploadDoc");
            this.el = {
               documentFileInput: "#dlgUploadDoc_DocumentFile",
               annotationsLoadOptionsRadioBtns: "#dlgUploadDoc input[name=dlgUploadDoc_AnnotationsLoadOptions]",
               annotationsFileInput: "#dlgUploadDoc_AnnotationsFile",
               uploadBtn: "#dlgUploadDoc_Upload",
               pageRangeBtn: "#dlgUploadDoc_PageRange",
               pageRangeDescription: "#dlgUploadDoc_PageRangeDescription",
               hide: "#dlgUploadDoc .dlg-close"
            };

            this.inner = new lt.Demos.Dialogs.InnerDialog(root);
            this.pageRangeDlg = new LoadDocumentPageRangeDlg();

            this.inner.onRootClick = this.onHide;
            $(this.el.hide).on("click", this.onHide);

            // Reset the dialog input elements, to avoid cached data
            $(this.el.documentFileInput).val("");
            $(this.el.annotationsFileInput).val("");

            var radioBtns = $(this.el.annotationsLoadOptionsRadioBtns);
            radioBtns.first().click();
            radioBtns.on("click", this.annotationsLoadOptionsRadioBtnsGroup_BtnClicked);

            $(this.el.pageRangeBtn).on("click", this.pageRangeBtn_Click);
            $(this.el.pageRangeDescription).text(this.pageRangeDlg.results.pageDescription);
            this.cachedFirstPage = this.pageRangeDlg.results.firstPage;
            this.cachedLastPage = this.pageRangeDlg.results.lastPage;

            this.pageRangeDlg.onSet = (e: LoadPageRangeEventArgs) => {
               $(this.el.pageRangeDescription).text(e.pageDescription);
               this.cachedLastPage = e.lastPage;
               this.cachedFirstPage = e.firstPage;
            };

            $(this.el.uploadBtn).on("click", this.uploadBtn_Click);
         }

         private onHide = () => {
            this.inner.hide();
         }

         public dispose(): void {
            $(this.el.hide).off("click", this.onHide);
            this.onHide = null;

            $(this.el.annotationsLoadOptionsRadioBtns).off("click", this.annotationsLoadOptionsRadioBtnsGroup_BtnClicked);
            this.annotationsLoadOptionsRadioBtnsGroup_BtnClicked = null;

            $(this.el.uploadBtn).off("click", this.uploadBtn_Click);
            this.uploadBtn_Click = null;

            $(this.el.pageRangeBtn).off("click", this.pageRangeBtn_Click);
            this.pageRangeBtn_Click = null;

            this.inner.onRootClick = null;
            this.inner.dispose();
            this.inner = null;
            this.el = null;
         }

         // Events 
         public onUpload: (documentloadArgs: UploadDocumentEventArgs) => void;

         public show(): void {
            this.inner.show();
         }
         private pageRangeBtn_Click = (e: JQueryEventObject) => {
            this.pageRangeDlg.inner.show();
         }
         private uploadBtn_Click = (e: JQueryEventObject) => {
            // Get the file object
            var documentFile = (<HTMLInputElement>$(this.el.documentFileInput)[0]).files[0];

            if (!documentFile) {
               alert("Please choose a document file first.");
               return;
            }
            var args = new UploadDocumentEventArgs();
            args.documentFile = documentFile;
            args.firstPage = this.cachedFirstPage;
            args.lastPage = this.cachedLastPage;

            var selectedAnnotationsLoadOption: AnnotationsLoadOption = $(this.el.annotationsLoadOptionsRadioBtns).filter(':checked').val();

            if (selectedAnnotationsLoadOption === AnnotationsLoadOption.none) {
               args.loadEmbeddedAnnotations = false;
               args.annotationFile = null;
            } else if (selectedAnnotationsLoadOption == AnnotationsLoadOption.embedded) {
               args.loadEmbeddedAnnotations = true;
               args.annotationFile = null;
            } else if (selectedAnnotationsLoadOption == AnnotationsLoadOption.external) {
               args.loadEmbeddedAnnotations = false;
               var annotationsFile = (<HTMLInputElement>$(this.el.annotationsFileInput)[0]).files[0];
               if (!annotationsFile) {
                  alert("Please choose an annotations file first.");
                  return;
               }
               args.annotationFile = annotationsFile;
            }

            this.inner.hide();
            if (this.onUpload)
               this.onUpload(args);
         }

         private annotationsLoadOptionsRadioBtnsGroup_BtnClicked = (e: JQueryEventObject) => {
            var selectedAnnotationsLoadOption: AnnotationsLoadOption = $(e.currentTarget).val();
            // If loading external annotations, enable annotations file input
            $(this.el.annotationsFileInput).prop("disabled", !(selectedAnnotationsLoadOption == AnnotationsLoadOption.external));
         }
      }

      interface OpenDocumentFromUrlDlgUI<T> {
         urlLoadOptionsRadioBtns: T,
         fileSampleSelectElement: T,
         fileUrlTextInput: T,
         annotationsLoadOptionsRadioBtns: T,
         annotationsUrlTextInput: T,
         loadBtn: T,
         pageRangeBtn: T,
         pageRangeDescription: T,
         hide: T
      }

      export class OpenDocumentFromUrlDlg implements lt.Demos.Dialogs.Dialog {

         public inner: lt.Demos.Dialogs.InnerDialog = null;
         private el: OpenDocumentFromUrlDlgUI<string> = null;

         private pageRangeDlg: LoadDocumentPageRangeDlg = null;
         private cachedFirstPage: number = null;
         private cachedLastPage: number = null; 

         private _sampleDocuments: string[] = null;

         private _selectedLoadAnnotations: AnnotationsLoadOption = AnnotationsLoadOption.none;
         private _selectedLoadFileUrl: FileUrlLoadOption = FileUrlLoadOption.sample;

         // Events 
         public onLoad: (documentloadArgs: OpenDocumentFromUrlEventArgs) => void;

         constructor(sampleDocuments: string[]) {
            this._sampleDocuments = sampleDocuments.slice();

            var root = $("#dlgOpenUrl");
            this.el = {
               urlLoadOptionsRadioBtns: "#dlgOpenUrl input[name=dlgOpenUrl_UrlOptions]",
               fileSampleSelectElement: "#dlgOpenUrl_FileSelect",
               fileUrlTextInput: "#dlgOpenUrl_FileUrl",
               annotationsLoadOptionsRadioBtns: "#dlgOpenUrl input[name=dlgOpenUrl_AnnotationsLoadOptions]",
               annotationsUrlTextInput: "#dlgOpenUrl_AnnotationsUrl",
               loadBtn: "#dlgOpenUrl_Load",
               pageRangeBtn: "#dlgOpenUrl_PageRange",
               pageRangeDescription: "#dlgOpenUrl_PageRangeDescription",
               hide: "#dlgOpenUrl .dlg-close"
            };

            this.inner = new lt.Demos.Dialogs.InnerDialog(root);
            this.pageRangeDlg = new LoadDocumentPageRangeDlg();

            this.inner.onRootClick = this.onHide;
            $(this.el.hide).on("click", this.onHide);

            // Reset the dialog input elements, to avoid cached data
            var $fileSelectElement = $(this.el.fileSampleSelectElement);
            $fileSelectElement.empty();
            $fileSelectElement.prop("selectedIndex", 0);

            // Add the options to the <select>
            this._sampleDocuments.forEach((documentUrl: string, index: number) => {
               var $option = $(document.createElement("option")).text(documentUrl);
               if (index === 0)
                  $option.attr("selected", "");
               $fileSelectElement.append($option);
            });

            $(this.el.urlLoadOptionsRadioBtns).on("click", this.urlLoadOptionsRadioBtnsGroup_BtnClicked);
            $(this.el.annotationsLoadOptionsRadioBtns).on("click", this.annotationsLoadOptionsRadioBtnsGroup_BtnClicked);
            $(this.el.loadBtn).on("click", this.loadBtn_Click);

            $(this.el.pageRangeBtn).on("click", this.pageRangeBtn_Click);
            $(this.el.pageRangeDescription).text(this.pageRangeDlg.results.pageDescription);
            this.cachedFirstPage = this.pageRangeDlg.results.firstPage;
            this.cachedLastPage = this.pageRangeDlg.results.lastPage;

            this.pageRangeDlg.onSet = (e: LoadPageRangeEventArgs) => {
               $(this.el.pageRangeDescription).text(e.pageDescription);
               this.cachedLastPage = e.lastPage;
               this.cachedFirstPage = e.firstPage;
            };

            this.updateUI();
         }

         private onHide = () => {
            this.inner.hide();
         }

         public dispose(): void {

            $(this.el.hide).off("click", this.onHide);
            this.onHide = null;

            $(this.el.urlLoadOptionsRadioBtns).off("click", this.urlLoadOptionsRadioBtnsGroup_BtnClicked);
            $(this.el.annotationsLoadOptionsRadioBtns).off("click", this.annotationsLoadOptionsRadioBtnsGroup_BtnClicked);
            $(this.el.loadBtn).off("click", this.loadBtn_Click);

            this.urlLoadOptionsRadioBtnsGroup_BtnClicked = null;
            this.annotationsLoadOptionsRadioBtnsGroup_BtnClicked = null;
            this.loadBtn_Click = null;

            $(this.el.pageRangeBtn).off("click", this.pageRangeBtn_Click);
            this.pageRangeBtn_Click = null;

            this.inner.onRootClick = null;
            this.inner.dispose();
            this.inner = null;
            this.el = null;
         }

         public show(): void {
            this.inner.show();
         }

         private urlLoadOptionsRadioBtnsGroup_BtnClicked = (e: JQueryEventObject) => {
            var fileUrl: FileUrlLoadOption = parseInt($(e.currentTarget).val(), 10);
            this._selectedLoadFileUrl = fileUrl;
            this.updateUI();
         }

         private annotationsLoadOptionsRadioBtnsGroup_BtnClicked = (e: JQueryEventObject) => {
            var selectedAnnotationsLoadOption: AnnotationsLoadOption = parseInt($(e.currentTarget).val());
            this._selectedLoadAnnotations = selectedAnnotationsLoadOption;
            this.updateUI();
         }

         private updateUI(): void {
            $(this.el.fileUrlTextInput).prop("disabled", this._selectedLoadFileUrl !== FileUrlLoadOption.url);
            $(this.el.annotationsLoadOptionsRadioBtns).prop("disabled", this._selectedLoadFileUrl !== FileUrlLoadOption.url);
            $(this.el.annotationsUrlTextInput).prop("disabled", this._selectedLoadFileUrl !== FileUrlLoadOption.url || this._selectedLoadAnnotations !== AnnotationsLoadOption.external);
            $(this.el.fileSampleSelectElement).prop("disabled", this._selectedLoadFileUrl !== FileUrlLoadOption.sample);
         }

         private pageRangeBtn_Click = (e: JQueryEventObject) => {
            this.pageRangeDlg.inner.show();
         }

         private loadBtn_Click = (e: JQueryEventObject) => {
            var args = new OpenDocumentFromUrlEventArgs();
            args.firstPage = this.cachedFirstPage;
            args.lastPage = this.cachedLastPage;

            var urlLoadOption: FileUrlLoadOption = this._selectedLoadFileUrl;
            var annLoadOption: AnnotationsLoadOption = this._selectedLoadAnnotations;

            if (urlLoadOption === FileUrlLoadOption.sample) {
               var selectedSampleIndex = $(this.el.fileSampleSelectElement).find(":selected").index();
               var sample = this._sampleDocuments[selectedSampleIndex];

               // If using a sample document, no annotations
               annLoadOption = AnnotationsLoadOption.none;
               args.fileUrl = OpenDocumentFromUrlDlg.getSampleUrl(sample);

            } else {
               var documentUrl: string = $(this.el.fileUrlTextInput).val();
               if (documentUrl)
                  documentUrl = documentUrl.trim();
               if (!documentUrl) {
                  alert("Must enter a document URL first");
                  return;
               }
               args.fileUrl = documentUrl;
            }

            if (annLoadOption == AnnotationsLoadOption.none) {
               args.loadEmbeddedAnnotations = false;
               args.annotationsUrl = null;
            } else if (annLoadOption == AnnotationsLoadOption.embedded) {
               args.loadEmbeddedAnnotations = true;
               args.annotationsUrl = null;
            } else if (annLoadOption == AnnotationsLoadOption.external) {
               args.loadEmbeddedAnnotations = false;
               var annotationsUrl: string = $(this.el.annotationsUrlTextInput).val();
               if (annotationsUrl)
                  annotationsUrl = annotationsUrl.trim();
               if (!annotationsUrl) {
                  alert("Must enter an external annotations URL first");
                  return;
               }
               args.annotationsUrl = $(this.el.annotationsUrlTextInput).val();
            }

            this.inner.hide();
            if (this.onLoad)
               this.onLoad(args);
         }

         public static getSampleUrl(name: string): string {
            if (name.indexOf("http") === 0) {
               return name;
            }
            else {
               var newDocumentUrl: string = 'Samples/' + name;

               var serviceBase = lt.Document.DocumentFactory.serviceUri;
               var serviceApiPath = lt.Document.DocumentFactory.serviceApiPath;
               if (serviceApiPath) {
                  var serviceApiPathIndex = serviceBase.lastIndexOf(serviceApiPath);
                  if (serviceApiPathIndex !== -1) {
                     serviceBase = serviceBase.substring(0, serviceApiPathIndex);
                  }
               }
               if (serviceBase.charAt(serviceBase.length - 1) !== "/")
                  serviceBase += "/";

               return serviceBase + newDocumentUrl;
            }
         }
      }

      interface OpenFromDocumentStorageDlgUI<T> {
         infoText: T,
         document: {
            oneDriveBtn: T,
            sharePointBtn: T,
            googleDriveBtn: T,
            name: T
         },
         annotations: {
            loadOptionsRadioBtns: T,
            oneDriveBtn: T,
            sharePointBtn: T,
            googleDriveBtn: T,
            name: T
         },
         loadBtn: T,
         pageRangeBtn: T,
         pageRangeDescription: T,
         hide: T,
      }

      export class OpenFromDocumentStorageDlg implements lt.Demos.Dialogs.Dialog {

         public inner: lt.Demos.Dialogs.InnerDialog = null;
         private el: OpenFromDocumentStorageDlgUI<string> = null;
         private pageRangeDlg: LoadDocumentPageRangeDlg = null;
         private cachedFirstPage: number = null;
         private cachedLastPage: number = null; 

         // Events 
         public onLoad: (storageLoadArgs: OpenFromDocumentStorageEventArgs) => void;

         constructor() {
            var root = $("#dlgOpenCloud");

            this.el = {
               infoText: "#dlgOpenCloud_InfoText",
               document: {
                  oneDriveBtn: "#dlgOpenCloud_Document_OneDrive",
                  sharePointBtn: "#dlgOpenCloud_Document_SharePoint",
                  googleDriveBtn: "#dlgOpenCloud_Document_GoogleDrive",
                  name: "#dlgOpenCloud_Document_File"
               },
               annotations: {
                  loadOptionsRadioBtns: "#dlgOpenCloud input[name=dlgOpenCloud_Annotations_LoadOptions]",
                  oneDriveBtn: "#dlgOpenCloud_Annotations_OneDrive",
                  sharePointBtn: "#dlgOpenCloud_Annotations_SharePoint",
                  googleDriveBtn: "#dlgOpenCloud_Annotations_GoogleDrive",
                  name: "#dlgOpenCloud_Annotations_File"
               },
               loadBtn: "#dlgOpenCloud_Load",
               pageRangeBtn: "#dlgOpenCloud_Document_PageRange",
               pageRangeDescription: "#dlgOpenCloud_Document_PageRangeDescription",
               hide: "#dlgOpenCloud .dlg-close"
            };

            this.inner = new lt.Demos.Dialogs.InnerDialog(root);
            this.pageRangeDlg = new LoadDocumentPageRangeDlg();

            $(this.el.hide).on("click", this.onHide);

            // Reset the dialog input elements, to avoid cached data
            $(this.el.annotations.loadOptionsRadioBtns).first().click();

            $(this.el.annotations.loadOptionsRadioBtns).on("click", this.annotationsLoadOptionsRadioBtnsGroup_BtnClicked);
            $(this.el.loadBtn).on("click", this.loadBtn_Click);

            // Create the arguments
            this._openFromDocumentStorageEventArgs = new OpenFromDocumentStorageEventArgs();
            this._oneDriveHelper = null; //new DriveHelper.LTOneDrive.OneDriveHelper();
            this._googleDriveHelper = null; //new DriveHelper.LTGoogleDrive.GoogleDriveHelper();

            $(this.el.pageRangeBtn).on("click", this.pageRangeBtn_Click);
            $(this.el.pageRangeDescription).text(this.pageRangeDlg.results.pageDescription);
            this.cachedFirstPage = this.pageRangeDlg.results.firstPage;
            this.cachedLastPage = this.pageRangeDlg.results.lastPage;

            this.pageRangeDlg.onSet = (e: LoadPageRangeEventArgs) => {
               $(this.el.pageRangeDescription).text(e.pageDescription);
               this.cachedLastPage = e.lastPage;
               this.cachedFirstPage = e.firstPage;
            };
         }

         private onHide = () => {
            this.inner.hide();
         }

         private pageRangeBtn_Click = (e: JQueryEventObject) => {
            this.pageRangeDlg.inner.show();
         }

         public dispose(): void {

            $(this.el.hide).off("click", this.onHide);
            this.onHide = null;

            $(this.el.annotations.loadOptionsRadioBtns).off("click", this.annotationsLoadOptionsRadioBtnsGroup_BtnClicked);
            this.annotationsLoadOptionsRadioBtnsGroup_BtnClicked = null;

            $(this.el.loadBtn).off("click", this.loadBtn_Click);
            this.loadBtn_Click = null;

            $(this.el.pageRangeBtn).off("click", this.pageRangeBtn_Click);
            this.pageRangeBtn_Click = null;

            this.inner.onRootClick = null;
            this.inner.dispose();
            this.inner = null;
            this.el = null;
         }

         public show(): void {
            this.inner.show();
         }

         private _openFromDocumentStorageEventArgs: OpenFromDocumentStorageEventArgs = null;

         // Helpers 
         private _oneDriveHelper: any; //DriveHelper.LTOneDrive.OneDriveHelper;
         private _googleDriveHelper: any; // DriveHelper.LTGoogleDrive.GoogleDriveHelper;
         public get googleDriveHelper(): any{ //DriveHelper.LTGoogleDrive.GoogleDriveHelper {
            return this._googleDriveHelper;
         }

         private _sharePointHelper: any; //DriveHelper.LTSharePoint.SharePointHelper;
         set sharePointHelper(value: any) { //DriveHelper.LTSharePoint.SharePointHelper) {
            this._sharePointHelper = value;
         }

         private _loadingAnnotationsFile: boolean;

         // SharePoint should be set and Google Drive should be registered before calling init
         public init(): void {
            // OneDrive
            this._oneDriveHelper.openDone = this.openDone;
            // SharePoint
            this._sharePointHelper.openDone = this.openDone;
            // GoogleDrive
            // if IE9, Google Drive (which is not supported) will throw an error. So don't create it.
            if (!(lt.LTHelper.browser === lt.LTBrowser.internetExplorer && lt.LTHelper.version <= 9)) {
               this._googleDriveHelper.openDone = this.openDone;
            }

            // Right now Google Drive and Microsoft OneDrive will get blocked on Microsoft Edge, so we disable them.
            if (lt.LTHelper.browser == lt.LTBrowser.edge) {
               $(this.el.infoText).text("Opening files from Microsoft OneDrive or Google Drive is not currently supported by Microsoft Edge.");
               $(this.el.document.oneDriveBtn).prop("disabled", true);
               $(this.el.document.googleDriveBtn).prop("disabled", true);
               $(this.el.annotations.oneDriveBtn).prop("disabled", true);
               $(this.el.annotations.googleDriveBtn).prop("disabled", true);
            }
            else {
               var googleIsRegistered = this._googleDriveHelper && this._googleDriveHelper.isRegisteredForLoad;
               var oneDriveIsRegistered = this._oneDriveHelper && this._oneDriveHelper.isRegisteredForLoadSave;

               if (googleIsRegistered) {
                  $(this.el.document.googleDriveBtn).on("click", this.openDocumentFromGoogleDriveBtn_Clicked);
                  $(this.el.annotations.googleDriveBtn).on("click", this.openAnnotationsFromGoogleDriveBtn_Clicked);
               }
               else {
                  $(this.el.document.googleDriveBtn).prop("disabled", true);
                  $(this.el.annotations.googleDriveBtn).prop("disabled", true);
               }

               if (oneDriveIsRegistered) {
                  $(this.el.document.oneDriveBtn).on("click", this.openDocumentFromOneDriveBtn_Clicked);
                  $(this.el.annotations.oneDriveBtn).on("click", this.openAnnotationsFromOneDriveBtn_Clicked);
               }
               else {
                  $(this.el.document.oneDriveBtn).prop("disabled", true);
                  $(this.el.annotations.oneDriveBtn).prop("disabled", true);
               }

               var vendorsDisabled = "";
               if (!googleIsRegistered) {
                  vendorsDisabled = "Google Drive";
               }
               if (!oneDriveIsRegistered) {
                  if (!googleIsRegistered)
                     vendorsDisabled += " and OneDrive are";
                  else
                     vendorsDisabled += "OneDrive is"
               }
               else if (!googleIsRegistered) {
                  vendorsDisabled += " is"
               }
               if (vendorsDisabled) {
                  $(this.el.infoText).text(vendorsDisabled + " not registered for loading.");
               }
               lt.Demos.Utils.Visibility.toggle($(this.el.infoText), !!vendorsDisabled);
            }

            $(this.el.document.sharePointBtn).on("click", this.openDocumentFromSharePointBtn_Clicked);
            $(this.el.annotations.sharePointBtn).on("click", this.openAnnotationsFromSharePointBtn_Clicked);
         }


         private openDocumentFromOneDriveBtn_Clicked = (e: JQueryEventObject) => {
            this._loadingAnnotationsFile = false;
            this._oneDriveHelper.open();
         }

         private openDocumentFromSharePointBtn_Clicked = (e: JQueryEventObject) => {
            this._loadingAnnotationsFile = false;
            this._sharePointHelper.open();
         }

         private openDocumentFromGoogleDriveBtn_Clicked = (e: JQueryEventObject) => {
            this._loadingAnnotationsFile = false;
            this._googleDriveHelper.open();
         }

         private openAnnotationsFromOneDriveBtn_Clicked = (e: JQueryEventObject) => {
            this._loadingAnnotationsFile = true;
            this._oneDriveHelper.open();
         }

         private openAnnotationsFromSharePointBtn_Clicked = (e: JQueryEventObject) => {
            this._loadingAnnotationsFile = true;
            this._sharePointHelper.open();
         }

         private openAnnotationsFromGoogleDriveBtn_Clicked = (e: JQueryEventObject) => {
            this._loadingAnnotationsFile = true;
            this._googleDriveHelper.open();
         }

         // Open done handler 
         private openDone = (file: any /*DriveHelper.DriveFile*/) => {
            if (file) {
               if (!this._loadingAnnotationsFile) {
                  // Open document file
                  $(this.el.document.name).text(file.name);
                  this._openFromDocumentStorageEventArgs.documentFile = file;
               } else {
                  // Open annotations file
                  $(this.el.annotations.name).text(file.name);
                  this._openFromDocumentStorageEventArgs.annotationsFile = file;
               }
            }
         }

         private annotationsLoadOptionsRadioBtnsGroup_BtnClicked = (e: JQueryEventObject) => {
            var selectedAnnotationsLoadOption: AnnotationsLoadOption = $(e.currentTarget).val();

            var loadExternal = selectedAnnotationsLoadOption == AnnotationsLoadOption.external;
            // If loading external annotations, enable annotations url text input
            $(this.el.annotations.sharePointBtn).prop("disabled", !loadExternal);

            // They must be disabled on Microsoft Edge
            if (lt.LTHelper.browser !== lt.LTBrowser.edge) {
               $(this.el.annotations.oneDriveBtn).prop("disabled", !loadExternal || !this._oneDriveHelper || !this._oneDriveHelper.isRegisteredForLoadSave);
               $(this.el.annotations.googleDriveBtn).prop("disabled", !loadExternal || !this._googleDriveHelper || !this._googleDriveHelper.isRegisteredForLoad);
            }
         }

         private loadBtn_Click = (e: JQueryEventObject) => {
            var args = this._openFromDocumentStorageEventArgs;
            args.firstPage = this.cachedFirstPage;
            args.lastPage = this.cachedLastPage;

            if (!args.documentFile) {
               alert("Please choose a document to load.");
               return;
            }

            var selectedAnnotationsLoadOption: AnnotationsLoadOption = parseInt($(this.el.annotations.loadOptionsRadioBtns).filter(':checked').val(), 10);
            switch (selectedAnnotationsLoadOption) {
               case AnnotationsLoadOption.none:
                  args.loadEmbeddedAnnotations = false;
                  args.annotationsFile = null;
                  break;
               case AnnotationsLoadOption.embedded:
                  args.loadEmbeddedAnnotations = true;
                  args.annotationsFile = null;
                  break;
               case AnnotationsLoadOption.external:
                  args.loadEmbeddedAnnotations = false;
                  if (!args.annotationsFile) {
                     alert("Please choose an annotations file to load.");
                     return;
                  }
                  break;
               default:
                  break;
            }

            this.inner.hide();
            if (this.onLoad)
               this.onLoad(args);
         }
      }

      interface LoadDocumentPageRangeDlgUI<T> {
         firstPageNumInput: T,
         lastPageNumInput: T,
         allPagesBtn: T,
         setPagesBtn: T,
         hide: T
      }

      export class LoadDocumentPageRangeDlg implements lt.Demos.Dialogs.Dialog {
         public inner: lt.Demos.Dialogs.InnerDialog = null;
         private el: LoadDocumentPageRangeDlgUI<string> = null;
         public results: LoadPageRangeEventArgs = null;

         public onSet: (loadPageRangeArgs: LoadPageRangeEventArgs) => void;

         constructor() {
            var root = $("#dlgLoadPageRangeOptions");
            this.el = {
               firstPageNumInput: "#dlgLoadPageRangeOptions_FirstPage",
               lastPageNumInput: "#dlgLoadPageRangeOptions_LastPage",
               allPagesBtn: "#dlgLoadPageRangeOptions_AllPages",
               setPagesBtn: "#dlgLoadPageRangeOptions_Set",
               hide: "#dlgLoadPageRangeOptions .dlg-close"
            };            

            this.inner = new lt.Demos.Dialogs.InnerDialog(root);
            this.inner.onRootClick = this.onHide;
            $(this.el.hide).on("click", this.onHide);

            // Reset the dialog input elements, to avoid cached data
            $(this.el.firstPageNumInput).val("1");
            $(this.el.lastPageNumInput).val("-1");
            this.results = {
               firstPage: 1,
               lastPage: -1,
               pageDescription: "All Pages"
            };
            
            $(this.el.allPagesBtn).on("click", this.allPagesBtn_Click);
            $(this.el.setPagesBtn).on("click", this.setPagesBtn_Click);
         }

         dispose(): void {
            $(this.el.hide).off("click", this.onHide);
            this.onHide = null;      

            $(this.el.allPagesBtn).off("click", this.allPagesBtn_Click);
            this.allPagesBtn_Click = null;

            $(this.el.setPagesBtn).off("click", this.setPagesBtn_Click);
            this.setPagesBtn_Click = null;

            this.inner.onRootClick = null;
            this.inner.dispose();
            this.inner = null;
            this.el = null;
         }

         private onHide = () => {
            this.inner.hide();
         }

         private allPagesBtn_Click = (e: JQueryEventObject) => {
            $(this.el.firstPageNumInput).val("1");
            $(this.el.lastPageNumInput).val("-1");

            this.updateResults()
         }

         private setPagesBtn_Click = (e: JQueryEventObject) => {
            let firstPageValue: number = +$(this.el.firstPageNumInput).val();
            let lastPageValue: number = +$(this.el.lastPageNumInput).val();

            if (firstPageValue < 1) {
               alert("First page value needs to be greater than or equal to 1");
               return;
            }

            if (lastPageValue < -1) {
               alert("Last page value needs to be greater than or equal to -1");
               return;
            }

            if (lastPageValue != -1 && lastPageValue != 0) {
               if (firstPageValue > lastPageValue) {
                  alert("The last page value must be greater than or equal to the first page value, except if passing a value of 0 or -1 to indicate all pages.")
                  return;
               }
            }

            this.updateResults()

            this.inner.hide();
            if (this.onSet)
               this.onSet(this.results);
         }

         private updateResults() {
            let firstPageValue: number = +$(this.el.firstPageNumInput).val();
            let lastPageValue: number = +$(this.el.lastPageNumInput).val();

            
            this.results.firstPage = firstPageValue;
            this.results.lastPage = lastPageValue;

            if (lastPageValue === -1 || lastPageValue === 0) {
               if (firstPageValue === 1)
                  this.results.pageDescription = "All pages";
               else
                  this.results.pageDescription = "All pages starting with page " + firstPageValue.toString();
            } else {
               if (this.results.firstPage == this.results.lastPage)
                  this.results.pageDescription = "Only page " + firstPageValue.toString();
               else
                  this.results.pageDescription = "From page " + firstPageValue.toString() + " to page " + lastPageValue.toString();
            }
         }
      }
   }
}