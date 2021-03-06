import React, { Component } from "react";
import {
  Text,
  View,
  TouchableWithoutFeedback,
  Platform,
  Image,
  Button,
  Modal,
  TouchableHighlight
} from "react-native";
import { connect } from "react-redux";
import customFieldStyles from "../styles/customField";
import { routes } from "../navigation/config";
import * as actions from "../actions";
import PhotoView from "react-native-photo-view";

class CustomFieldMedia extends Component {
  constructor(props) {
    super(props);
    this.state = {
      ...props,
      cfNamespace: props.cfNamespace,
      isOpenedModalImage: false
    };
  }

  // Run after component loaded, if the actual content is an image, otherwise it will download it, by the button push
  componentDidMount() {
    var imageExtensions = [
      "jpg",
      "gif",
      "png",
      "bmp",
      "JPG",
      "GIF",
      "PNG",
      "BMP"
    ];
    if (
      this.props.value &&
      imageExtensions.indexOf(this.props.value.split(".").pop()) >= 0
    ) {
      var payload = {
        fieldid: this.props.id,
        jobOrRouteId: this.props.jobOrRouteId.toString(),
        filename: this.props.value,
        cfNamespace: this.props.cfNamespace
      };
      this.props.downloadMediaCustomFiledThumbnails(payload);
    }
  }

  _getMimeTypeByExtension = extension => {
    let mimetype = "";
    switch (
      extension // mime type
    ) {
      case "mp4":
        mimetype = "video/mp4";
        break;
      case "avi":
        mimetype = "video/x-msvideo";
        break;
      case "wmv":
        mimetype = "video/x-ms-wmv";
        break;
      case "ogv":
        mimetype = "video/ogg";
        break;
      case "webm":
        mimetype = "video/webm";
        break;
      default:
        mimetype = "application/octet-stream";
        break;
    }
    return mimetype;
  };

  onClickDownload = () => {
    var payload = {
      fieldid: this.props.id,
      jobOrRouteId: this.props.jobOrRouteId.toString(),
      filename: this.props.value,
      cfNamespace: this.props.cfNamespace
    };
    this.props.downloadAndOpenWithExternalApp(payload);
  };

  _openModalImage = () => {
    if (
      this.props.imgurl === null ||
      this.props.imgurl === undefined ||
      this.props.imgurl.trim() === ""
    ) {
      var payload = {
        fieldid: this.props.id,
        jobOrRouteId: this.props.jobOrRouteId.toString(),
        filename: this.props.value,
        cfNamespace: this.props.cfNamespace
      };

      this.props.downloadMediaCustomFiledFile(payload);
    }
    this.setState({
      isOpenedModalImage: true
    });
  };

  _closeModalImage = () => {
    this.setState({
      isOpenedModalImage: false
    });
  };

  _uploadNewContent = () => {
    var ImagePicker = require("react-native-image-picker");
    // More info on all the options is below in the README...just some common use cases shown here
    var options = {
      title: "Select uploadable",
      customButtons: [{ name: "signaturedraw", title: "Signature draw" }],
      storageOptions: {
        skipBackup: true,
        path: "images"
      }
    };

    /**
     * The first arg is the options object for customization (it can also be null or omitted for default options),
     * The second arg is the callback which sends object: response (more info below in README)
     */
    ImagePicker.showImagePicker(options, response => {
      // console.debug("response", response);
      if (response.customButton) {
        if (response.customButton === "signaturedraw") {
          const navigator = this.props.navigator;
          if (navigator) {
            navigator.push(routes.signature(this._saveMedia));
          }
        }
      } else {
        this._saveMedia(response);
      }
    });
  };

  _saveMedia = response => {
    let source = { uri: response.uri };
    var payload = {
      fieldid: this.props.id,
      jobOrRouteId: this.props.jobOrRouteId.toString(),
      cfNamespace: this.props.cfNamespace,
      filename: response.fileName,
      uploadFile: response.data,
      filePath: response.uri
    };
    this.props.uploadMediaCustomFiledFile(payload);

    this.props.onSave && this.props.onSave(response.fileName);

    this.setState({
      avatarSource: source
    });
  };

  renderTextInput() {
    if (
      (this.props.imgurl !== undefined && this.props.imgurl !== null) ||
      (this.props.thumbImgUrl !== undefined && this.props.thumbImgUrl !== null)
    ) {
      var url = this.props.imgurl;
      var thumbnailUrl = this.props.imgurl
        ? this.props.imgurl
        : this.props.thumbImgUrl;
      var iscontentType = url
        ? url.indexOf("content://") >= 0 || url.indexOf("file://") >= 0
        : false;

      if (!iscontentType) {
        url = "file://" + this.props.imgurl;
      }
      if (Platform.OS === "android" && !iscontentType) {
        thumbnailUrl = "file://" + thumbnailUrl;
      }

      return (
        <View style={customFieldStyles.mediaFieldContainer}>
          <TouchableHighlight
            onPress={this._openModalImage}
            style={customFieldStyles.mediaFieldTitle}
          >
            <Text style={customFieldStyles.mediaFieldTitleText}>
              {this.props.label}
            </Text>
          </TouchableHighlight>
          <TouchableHighlight onPress={this._openModalImage}>
            <Image
              source={{ isStatic: true, uri: thumbnailUrl }}
              style={{ width: "100%", height: 200 }}
            />
          </TouchableHighlight>
          {this.props.cfNamespace === "job" && (
            <Button
              title={
                this.props.uploadprogress !== null &&
                this.props.uploadprogress !== undefined &&
                this.props.uploadprogress !== "NaN"
                  ? " Uploading...  " + this.props.uploadprogress + " %"
                  : "Upload new media"
              }
              onPress={this._uploadNewContent}
              style={customFieldStyles.mediaUploadButton}
            />
          )}
          <Modal
            visible={this.state.isOpenedModalImage}
            transparent={false}
            onRequestClose={this._closeModalImage}
          >
            <Button title="Close" onPress={this._closeModalImage} />
            {!this.props.imgurl && (
              <View
                style={{
                  height: "100%",
                  width: "100%",
                  backgroundColor: "#000000"
                }}
              >
                <Text style={customFieldStyles.modalLoadingText}>
                  Loading {this.props.progress}%
                </Text>
              </View>
            )}
            {!!this.props.imgurl && (
              <PhotoView
                source={{ uri: url }}
                minimumZoomScale={0.5}
                maximumZoomScale={5}
                androidScaleType="fitCenter"
                onViewTap={this._closeModalImage}
                onLoad={() => console.debug("image loaded")}
                style={{
                  height: "100%",
                  width: "100%",
                  backgroundColor: "#000000"
                }}
              />
            )}
          </Modal>
        </View>
      );
    } else {
      // if it is a video content
      if (this.props.value !== undefined && this.props.value !== null) {
        return (
          <View>
            <TouchableHighlight
              onPress={this.onClickDownload}
              style={customFieldStyles.mediaFieldTitle}
            >
              <Text style={customFieldStyles.mediaFieldTitleText}>
                {this.props.progress !== null &&
                this.props.progress !== undefined &&
                this.props.progress !== "NaN"
                  ? " loading video...  " + this.props.progress + " %"
                  : this.props.label}
              </Text>
            </TouchableHighlight>
            <TouchableHighlight onPress={this.onClickDownload}>
              <Image
                source={require("../resources/player.png")}
                style={{ width: "100%", height: 200 }}
              />
            </TouchableHighlight>
            {this.props.cfNamespace === "job" && (
              <Button
                title={
                  this.props.uploadprogress !== null &&
                  this.props.uploadprogress !== undefined &&
                  this.props.uploadprogress !== "NaN"
                    ? " Uploading...  " + this.props.uploadprogress + " %"
                    : "Upload new media"
                }
                onPress={this._uploadNewContent}
                style={customFieldStyles.mediaUploadButton}
              />
            )}
          </View>
        );
      } else {
        return (
          <View>
            <Text style={customFieldStyles.title}>{this.props.label}</Text>
            {this.props.cfNamespace === "job" && (
              <Button
                title={
                  this.props.uploadprogress !== null &&
                  this.props.uploadprogress !== undefined &&
                  this.props.uploadprogress !== "NaN"
                    ? " Uploading...  " + this.props.uploadprogress + " %"
                    : "Upload new media"
                }
                onPress={this._uploadNewContent}
                style={customFieldStyles.mediaUploadButton}
              />
            )}
          </View>
        );
      }
    }
  }

  render() {
    if (Platform.OS === "ios") {
      return (
        <TouchableWithoutFeedback onPress={() => this.input.focus()}>
          {this.renderTextInput()}
        </TouchableWithoutFeedback>
      );
    } else {
      return this.renderTextInput();
    }
  }
}

const mapStateToProps = (initialState, initialProps) => {
  let stateToProps;
  if (initialProps.cfNamespace === "job") {
    stateToProps = {
      imgurl:
        initialState.jobs.byId.customFieldsFiles &&
        initialState.jobs.byId.customFieldsFiles[initialProps.jobOrRouteId]
          ? initialState.jobs.byId.customFieldsFiles[initialProps.jobOrRouteId][
              initialProps.id
            ]
          : null,
      thumbImgUrl:
        initialState.jobs.byId.customFieldsThumbnails &&
        initialState.jobs.byId.customFieldsThumbnails[initialProps.jobOrRouteId]
          ? initialState.jobs.byId.customFieldsThumbnails[
              initialProps.jobOrRouteId
            ][initialProps.id]
          : null,
      progress: initialState.jobs.byId.progress
        ? parseFloat(
            initialState.jobs.byId.progress[initialProps.jobOrRouteId][
              initialProps.id
            ]
          ).toFixed(1)
        : null,
      uploadprogress:
        initialState.jobs.byId.uploadprogress &&
        initialState.jobs.byId.uploadprogress[initialProps.jobOrRouteId] &&
        initialState.jobs.byId.uploadprogress[initialProps.jobOrRouteId][
          initialProps.id
        ]
          ? parseFloat(
              initialState.jobs.byId.uploadprogress[initialProps.jobOrRouteId][
                initialProps.id
              ]
            ).toFixed(1)
          : null
    };
  } else {
    stateToProps = {
      imgurl:
        initialState.jobs.byId.customFieldsFiles &&
        initialState.jobs.byId.customFieldsFiles[initialProps.jobOrRouteId]
          ? initialState.jobs.byId.customFieldsFiles[initialProps.jobOrRouteId][
              initialProps.id
            ]
          : null,
      thumbImgUrl:
        initialState.jobs.byId.customFieldsThumbnails &&
        initialState.jobs.byId.customFieldsThumbnails[initialProps.jobOrRouteId]
          ? initialState.jobs.byId.customFieldsThumbnails[
              initialProps.jobOrRouteId
            ][initialProps.id]
          : null,
      progress: initialState.jobs.byId.progress
        ? parseFloat(
            initialState.jobs.byId.progress[initialProps.jobOrRouteId][
              initialProps.id
            ]
          ).toFixed(1)
        : null,
      uploadprogress: initialState.jobs.byId.uploadprogress
        ? parseFloat(
            initialState.jobs.byId.uploadprogress[initialProps.jobOrRouteId][
              initialProps.id
            ]
          ).toFixed(1)
        : null
    };
  }
  return stateToProps;
};

const mapDispatchToProps = {
  downloadMediaCustomFiledThumbnails:
    actions.downloadMediaCustomFiledThumbnails.init,
  downloadMediaCustomFiledFile: actions.downloadMediaCustomFiledFile.init,
  uploadMediaCustomFiledFile: actions.uploadMediaCustomFiledFile.init,
  downloadAndOpenWithExternalApp: actions.downloadAndOpenWithExternalApp
};

export default connect(mapStateToProps, mapDispatchToProps)(CustomFieldMedia);
