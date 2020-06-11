﻿// *************************************************************
// Copyright (c) 1991-2019 LEAD Technologies, Inc.
// All Rights Reserved.
// *************************************************************
module HTML5Demos {

   export module Dialogs {

      interface DocumentViewerOptionsDlgUI<T> {
         hookPrepareAjax: T,
         useAjaxImageLoading: T,
         usePDFRenderingCheckbox: T,
         usePDFTextCheckbox: T,
         verifyUploadedMimeTypes: T,
         view: {
            numberOfWorkersTextInput: T,
            lazyLoadCheckbox: T,
            useCSSTransitions: T,
         },
         thumbs: {
            numberOfWorkersTextInput: T,
            lazyLoadCheckbox: T,
            useGridsCheckbox: T,
            pixelSizeTextInput: T,
         },
         export: {
            useStatusQueryRequestsCheckbox: T
         },
         heartbeat: {
            enabled: T,
            start: T,
            interval: T,
            inactivity: T
         },
         loadMode: {
            documentLoadModeSelection: T,
            documentLoadModeDescription: T,
         }
         applyBtn: T,
         hide: T
      }

      export class DocumentViewerOptionsDlg implements lt.Demos.Dialogs.Dialog {

         public inner: lt.Demos.Dialogs.InnerDialog = null;
         private el: DocumentViewerOptionsDlgUI<string> = null;

         constructor() {
            var root = $("#dlgOptions");
            this.el = {
               hookPrepareAjax: "#dlgOptions_HookPrepareAjax",
               useAjaxImageLoading: "#dlgOptions_UseAjaxImageLoading",
               usePDFRenderingCheckbox: "#dlgOptions_UsePDFRendering",
               usePDFTextCheckbox: "#dlgOptions_UsePDFText",
               verifyUploadedMimeTypes: "#dlgOptions_VerifyUploadedMimeTypes",
               view: {
                  numberOfWorkersTextInput: "#dlgOptions_View_NumberOfWorkers",
                  lazyLoadCheckbox: "#dlgOptions_View_LazyLoad",
                  useCSSTransitions: "#dlgOptions_View_CSSTransitions",
               },
               thumbs: {
                  numberOfWorkersTextInput: "#dlgOptions_Thumbs_NumberOfWorkers",
                  lazyLoadCheckbox: "#dlgOptions_Thumbs_LazyLoad",
                  useGridsCheckbox: "#dlgOptions_Thumbs_UseGrids",
                  pixelSizeTextInput: "#dlgOptions_Thumbs_PixelSize",
               },
               export: {
                  useStatusQueryRequestsCheckbox: "#dlgOptions_Export_UseStatus"
               },
               heartbeat: {
                  enabled: "#dlgOptions_Heartbeat_Enabled",
                  start: "#dlgOptions_Heartbeat_Start",
                  interval: "#dlgOptions_Heartbeat_Interval",
                  inactivity: "#dlgOptions_Heartbeat_AutoPause"
               },
               loadMode: {
                  documentLoadModeSelection: "#dlgOptions_LoadDocumentMode",
                  documentLoadModeDescription: "#dlgOptions_LoadDocumentModeDescription",
               },
               applyBtn: "#dlgOptions_Apply",
               hide: "#dlgOptions .dlg-close"
            };

            this.inner = new lt.Demos.Dialogs.InnerDialog(root);

            this.inner.onRootClick = this.onHide;
            $(this.el.hide).on("click", this.onHide);

            $(this.el.usePDFRenderingCheckbox).on("change", this.usePDFRenderingCheckbox_Changed);
            $(this.el.usePDFTextCheckbox).on("change", this.usePDFTextCheckbox_Changed);
            $(this.el.view.numberOfWorkersTextInput).on("change", this.viewNumberOfWorkersTextInput_Changed);
            $(this.el.thumbs.numberOfWorkersTextInput).on("change", this.thumbnailsNumberOfWorkersTextInput_Changed);
            $(this.el.thumbs.pixelSizeTextInput).on("change", this.pixelSizeTextInput_Changed);
            $(this.el.thumbs.useGridsCheckbox).on("change", this.useGridsCheckbox_CheckedChanged);
            $(this.el.heartbeat.enabled).on("change", this.heartbeatEnabledCheckbox_CheckedChanged);
            $(this.el.loadMode.documentLoadModeSelection).on("change", this.documentLoadModeSelection_Changed);
            $(this.el.applyBtn).on("click", this.apply_Click);
         }

         private onHide = () => {
            this.inner.hide();
         }

         public dispose(): void {
            $(this.el.hide).off("click", this.onHide);
            this.onHide = null;

            $(this.el.usePDFRenderingCheckbox).off("change", this.usePDFRenderingCheckbox_Changed);
            $(this.el.usePDFTextCheckbox).off("change", this.usePDFTextCheckbox_Changed);
            $(this.el.loadMode.documentLoadModeSelection).off("change", this.documentLoadModeSelection_Changed);
            $(this.el.view.numberOfWorkersTextInput).off("change", this.viewNumberOfWorkersTextInput_Changed);
            $(this.el.thumbs.numberOfWorkersTextInput).off("change", this.thumbnailsNumberOfWorkersTextInput_Changed);
            $(this.el.thumbs.pixelSizeTextInput).off("change", this.pixelSizeTextInput_Changed);
            $(this.el.thumbs.useGridsCheckbox).off("change", this.useGridsCheckbox_CheckedChanged);
            $(this.el.applyBtn).off("click", this.apply_Click);

            this.usePDFRenderingCheckbox_Changed = null;
            this.usePDFTextCheckbox_Changed = null;
            this.documentLoadModeSelection_Changed = null;
            this.viewNumberOfWorkersTextInput_Changed = null;
            this.thumbnailsNumberOfWorkersTextInput_Changed = null;
            this.pixelSizeTextInput_Changed = null;
            this.useGridsCheckbox_CheckedChanged = null;

            this.inner.onRootClick = null;
            this.inner.dispose();
            this.inner = null;
         }

         // Track whether we have logged to the console that PDF Rendering is unavailable.
         private _hasGivenPDFRenderingWarning: boolean = false;

         private _documentViewer: lt.Document.Viewer.DocumentViewer;
         public set documentViewer(value: lt.Document.Viewer.DocumentViewer) {
            this._documentViewer = value;

            if (!this._hasGivenPDFRenderingWarning && !lt.Document.Viewer.DocumentViewer.isPDFRenderingSupported) {
               this._hasGivenPDFRenderingWarning = true;
               // PDF Rendering is only supported on certain browsers and devices, and "shouldUsePDFRendering" checks for the presence of the global PDF Rendering object and the browser.
               lt.LTHelper.logWarning("PDF Rendering is unavailable, and thus not selectable.")
               $(this.el.usePDFRenderingCheckbox).prop("disabled", true);
               $(this.el.usePDFTextCheckbox).prop("disabled", true);
            }

            // Initialize the inputs values from the viewer
            this.initInputsValues(false);
         }

         public set hasUserToken(value: boolean) {
            if (value) {
               $(this.el.useAjaxImageLoading).prop("disabled", true);
            } else {
               $(this.el.useAjaxImageLoading).prop("disabled", false);
            }
         }

         public loadDocumentMode: lt.Document.DocumentLoadMode;
         public hookPrepareAjax: boolean;
         public useCSSTransitions: boolean;
         public useStatusQueryRequests: boolean;
         public verifyUploadedMimeTypes: boolean;
         public heartbeatEnabled: boolean = false;
         public heartbeatStart: number = 0;
         public heartbeatInterval: number = 0;
         public heartbeatAutoPause: number = 0;
         public onApply: () => void;

         // Run each time the PDF Rendering checkbox is set
         private initInputsValues(afterPDFRenderingChange: boolean): void {
            var usePDFRendering = this._documentViewer.usePDFRendering;
            $(this.el.usePDFRenderingCheckbox).prop("checked", usePDFRendering);
            var usePDFText = this._documentViewer.usePDFText;
            $(this.el.usePDFTextCheckbox)
               .prop("disabled", !usePDFRendering)
               .prop("checked", usePDFText);

            // Document Viewer
            if (!afterPDFRenderingChange) {
               // Hook Prepare Ajax
               $(this.el.hookPrepareAjax).prop("checked", this.hookPrepareAjax);
            }
            // Use Ajax Image Loading (off for pages when using PDF Rendering)
            $(this.el.useAjaxImageLoading).prop("checked", this._documentViewer.useAjaxImageLoading);

            $(this.el.verifyUploadedMimeTypes).prop("checked", this.verifyUploadedMimeTypes);

            // View
            // Number of Workers - (not used with PDF Rendering)
            $(this.el.view.numberOfWorkersTextInput).val(this._documentViewer.view.workerCount.toString());
            // Lazy Load - (not used with PDF Rendering)
            $(this.el.view.lazyLoadCheckbox).prop("checked", this._documentViewer.view.lazyLoad);
            // CSS Transitions
            if (!afterPDFRenderingChange) {
               $(this.el.view.useCSSTransitions).prop("checked", this.useCSSTransitions);
            }

            // Thumbnails
            if (!this._documentViewer.thumbnails) {
               // Disable and clear all thumbnails options
               $(this.el.thumbs.numberOfWorkersTextInput).prop("disabled", true).val("");
               $(this.el.thumbs.lazyLoadCheckbox).prop("disabled", true).prop("checked", false);
               $(this.el.thumbs.useGridsCheckbox).prop("disabled", true).prop("checked", false);
               $(this.el.thumbs.pixelSizeTextInput).prop("disabled", true).val("");
            } else {
               // Enable all thumbnails options, and set the values from the viewer
               // Number of Workers - (not used with PDF Rendering)
               $(this.el.thumbs.numberOfWorkersTextInput).val(this._documentViewer.thumbnails.workerCount.toString());
               // Lazy Load - (not used with PDF Rendering)
               $(this.el.thumbs.lazyLoadCheckbox).prop("checked", this._documentViewer.thumbnails.lazyLoad);
               // Use Grids - (not used with PDF Rendering)
               $(this.el.thumbs.useGridsCheckbox).prop("checked", this._documentViewer.thumbnails.useGrids);
               // Pixel Size - (not used with PDF Rendering)
               $(this.el.thumbs.pixelSizeTextInput)
                  .prop("disabled", !this._documentViewer.thumbnails.useGrids)
                  .val(this._documentViewer.thumbnails.gridPixelSize.toString());
            }

            // Load document mode
            $(this.el.loadMode.documentLoadModeSelection).prop("selectedIndex", <number>(this.loadDocumentMode));
            this.updateOptions(this.loadDocumentMode);

            // // Heartbeat
            // if (!DocumentViewerDemo.DocumentViewerDemoApp.isMobileVersion) {
            //    $(this.el.heartbeat.enabled).prop("checked", this.heartbeatEnabled);
            //    $(this.el.heartbeat.start).prop("disabled", !this.heartbeatEnabled).val(this.heartbeatStart.toString());
            //    $(this.el.heartbeat.interval).prop("disabled", !this.heartbeatEnabled).val(this.heartbeatInterval.toString());
            //    $(this.el.heartbeat.inactivity).prop("disabled", !this.heartbeatEnabled).val(this.heartbeatAutoPause.toString());
            // }

            $(this.el.export.useStatusQueryRequestsCheckbox).prop("checked", this.useStatusQueryRequests);
         }

         public show(): void {
            this.inner.show();
         }

         private usePDFRenderingCheckbox_Changed = (e: JQueryEventObject) => {
            // It must not be disabled at this point
            // We update this ourselves now, so we don't need to when the OK button is clicked
            this._documentViewer.usePDFRendering = $(e.currentTarget).is(':checked') && lt.Document.Viewer.DocumentViewer.isPDFRenderingSupported;
            this.initInputsValues(true);
         }

         private usePDFTextCheckbox_Changed = (e: JQueryEventObject) => {
            // It must not be disabled at this point
            // We update this ourselves now, so we don't need to when the OK button is clicked
            this._documentViewer.usePDFText = $(e.currentTarget).is(':checked') && lt.Document.Viewer.DocumentViewer.isPDFRenderingSupported;
            this.initInputsValues(true);
         }

         private updateOptions(loadMode: lt.Document.DocumentLoadMode): void {
            var disableHeartbeat: boolean = false;
            if (loadMode != lt.Document.DocumentLoadMode.service) {
               disableHeartbeat = true;

               if (lt.Document.Viewer.DocumentViewer.isPDFRenderingSupported) {
                  $(this.el.usePDFRenderingCheckbox).prop("disabled", true).prop("checked", true);
                  $(this.el.usePDFTextCheckbox).prop("disabled", true).prop("checked", true);
                  this._documentViewer.usePDFRendering = true;
                  this._documentViewer.usePDFText = true;
               }
            }
            else {
               $(this.el.usePDFRenderingCheckbox).prop("disabled", !lt.Document.Viewer.DocumentViewer.isPDFRenderingSupported);
               $(this.el.usePDFTextCheckbox).prop("disabled", !lt.Document.Viewer.DocumentViewer.isPDFRenderingSupported);
            }

            $(this.el.loadMode.documentLoadModeDescription).text($(this.el.loadMode.documentLoadModeSelection).children("option:selected").attr("description"));
            $(this.el.heartbeat.enabled).prop("disabled", disableHeartbeat);
         }

         private documentLoadModeSelection_Changed = (e: JQueryEventObject) => {
            this.loadDocumentMode = <lt.Document.DocumentLoadMode>(parseInt($(e.currentTarget).val()));
            this.updateOptions(this.loadDocumentMode);
         }

         private viewNumberOfWorkersTextInput_Changed = (e: JQueryEventObject) => {
            // Check for valid inputs from the user(integer number : must be 1 and up)
            var value = parseInt($(e.currentTarget).val());
            if (!(value && value >= 1)) {
               $(e.currentTarget).val(this._documentViewer.view.workerCount.toString());
            }
         }

         private thumbnailsNumberOfWorkersTextInput_Changed = (e: JQueryEventObject) => {
            // Check for valid inputs from the user(integer number : must be 1 and up)
            var value = parseInt($(e.currentTarget).val());
            if (!(value && value >= 1)) {
               $(e.currentTarget).val(this._documentViewer.thumbnails.workerCount.toString());
            }
         }

         private pixelSizeTextInput_Changed = (e: JQueryEventObject) => {
            // Check for valid inputs from the user(integer number : must be 1 and up)
            var value = parseInt($(e.currentTarget).val());
            if (!(value && value >= 1 && value <= 4000)) {
               $(e.currentTarget).val(this._documentViewer.thumbnails.gridPixelSize.toString());
            }
         }

         private useGridsCheckbox_CheckedChanged = (e: JQueryEventObject) => {
            $(this.el.thumbs.pixelSizeTextInput).prop("disabled", !($(e.currentTarget).is(':checked')));
         }

         private heartbeatEnabledCheckbox_CheckedChanged = (e: JQueryEventObject) => {
            var isDisabled = !($(e.currentTarget).is(':checked'));
            $(this.el.heartbeat.start).prop("disabled", isDisabled);
            $(this.el.heartbeat.interval).prop("disabled", isDisabled);
            $(this.el.heartbeat.inactivity).prop("disabled", isDisabled);
         }

         private apply_Click = (e: JQueryEventObject) => {

            this.hookPrepareAjax = $(this.el.hookPrepareAjax).is(':checked');
            this.useCSSTransitions = $(this.el.view.useCSSTransitions).is(':checked');
            this.verifyUploadedMimeTypes = $(this.el.verifyUploadedMimeTypes).is(':checked');
            this._documentViewer.useAjaxImageLoading = $(this.el.useAjaxImageLoading).is(':checked');
            this._documentViewer.view.workerCount = parseInt($(this.el.view.numberOfWorkersTextInput).val(), 10);
            this._documentViewer.view.lazyLoad = $(this.el.view.lazyLoadCheckbox).is(':checked');
            if (this._documentViewer.thumbnails) {
               this._documentViewer.thumbnails.workerCount = parseInt($(this.el.thumbs.numberOfWorkersTextInput).val(), 10);
               this._documentViewer.thumbnails.lazyLoad = $(this.el.thumbs.lazyLoadCheckbox).is(':checked');
               this._documentViewer.thumbnails.useGrids = $(this.el.thumbs.useGridsCheckbox).is(':checked');
               this._documentViewer.thumbnails.gridPixelSize = parseInt($(this.el.thumbs.pixelSizeTextInput).val(), 10);
            }

            this.useStatusQueryRequests = $(this.el.export.useStatusQueryRequestsCheckbox).is(':checked');

            // if (!DocumentViewerDemo.DocumentViewerDemoApp.isMobileVersion) {
            //    this.heartbeatEnabled = !$(this.el.heartbeat.enabled).is(':disabled') && $(this.el.heartbeat.enabled).is(':checked');
            //    if (this.heartbeatEnabled) {
            //       var start = parseInt($(this.el.heartbeat.start).val(), 10);
            //       if (isNaN(start) || start < 1000) {
            //          alert("Invalid value for Heartbeat Start Timeout.\nPlease provide a number larger than or equal to 1000.");
            //          return;
            //       }

            //       var interval = parseInt($(this.el.heartbeat.interval).val(), 10);
            //       if (isNaN(interval) || interval < 5000) {
            //          alert("Invalid value for Heartbeat Interval.\nPlease provide a number larger than or equal to 5000.");
            //          return;
            //       }

            //       var inactivity = parseInt($(this.el.heartbeat.inactivity).val(), 10);
            //       if (isNaN(inactivity) || inactivity < 1000) {
            //          alert("Invalid value for Heartbeat Inactivity Timeout.\nPlease provide a larger than or equal to 1000 and larger than the Heartbeat Start Timeout.");
            //          return;
            //       }

            //       if (inactivity < start) {
            //          alert("The Heartbeat Inactivity Timeout must be greater than the Heartbeat Start Timeout.");
            //          return;
            //       }

            //       this.heartbeatStart = start;
            //       this.heartbeatInterval = interval;
            //       this.heartbeatAutoPause = inactivity;
            //    }
            // }

            this.inner.hide();
            if (this.onApply)
               this.onApply();
         }
      }
   }
}