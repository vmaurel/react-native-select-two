//import liraries
import React, { Component } from "react";
import {
  Text,
  StyleSheet,
  TouchableOpacity,
  View,
  FlatList,
  TextInput,
  Dimensions,
  Animated,
  Platform,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import Modal from "react-native-modal";
import Button from "./lib/Button";
import TagItem from "./lib/TagItem";
import utilities from "./lib/utilities";
import PropTypes from "prop-types";

const { height } = Dimensions.get("window");
const INIT_HEIGHT = height * 0.6;
// create a component
class Select2 extends Component {
  static defaultProps = {
    cancelButtonText: "Cancel",
    selectButtonText: "Select",
    searchPlaceHolderText: "Start typing...",
    listEmptyTitle: "No item to select",
    colorTheme: "#16a45f",
    buttonTextStyle: {},
    buttonStyle: {},
    showSearchBox: true,
    searchBoxTextChanged: () => {},
  };
  state = {
    show: false,
    preSelectedItem: [],
    selectedItem: [],
    data: [],
    keyword: "",
  };
  animatedHeight = new Animated.Value(INIT_HEIGHT);

  componentDidMount() {
    this.init();
  }

  UNSAFE_componentWillReceiveProps(newProps) {
    this.init(newProps);
  }

  init(newProps) {
    let preSelectedItem = [];
    let { data } = newProps || this.props;
    data.map((item) => {
      if (item.checked) {
        preSelectedItem.push(item);
      }
    });
    this.setState({ data, preSelectedItem });
  }

  get dataRender() {
    let { data, keyword } = this.state;
    let listMappingKeyword = [];
    data.map((item) => {
      if (
        utilities
          .changeAlias(item.name)
          .includes(utilities.changeAlias(keyword))
      ) {
        listMappingKeyword.push(item);
      }
    });
    return listMappingKeyword;
  }

  get defaultFont() {
    let { defaultFontName } = this.props;
    return defaultFontName ? { fontFamily: defaultFontName } : {};
  }

  cancelSelection() {
    let { data, preSelectedItem } = this.state;
    data.map((item) => {
      item.checked = false;
      for (let _selectedItem of preSelectedItem) {
        if (item.id === _selectedItem.id) {
          item.checked = true;
          break;
        }
      }
    });
    this.setState({
      data,
      show: false,
      keyword: "",
      selectedItem: preSelectedItem,
    });
  }

  keyExtractor = (item, idx) => idx.toString();
  renderItem = ({ item, idx }) => {
    let { colorTheme, isSelectSingle } = this.props;
    return (
      <TouchableOpacity
        key={idx}
        onPress={() => this.onItemSelected(item, isSelectSingle)}
        activeOpacity={0.7}
        style={styles.itemWrapper}
      >
        <Text style={[styles.itemText, this.defaultFont]}>{item.name}</Text>
        {!isSelectSingle && (
          <Icon
            style={styles.itemIcon}
            name={item.checked ? "check-circle-outline" : "radiobox-blank"}
            color={item.checked ? colorTheme : "#777777"}
            size={20}
          />
        )}
      </TouchableOpacity>
    );
  };
  renderEmpty = () => {
    let { listEmptyTitle } = this.props;
    return (
      <Text style={[styles.empty, this.defaultFont]}>{listEmptyTitle}</Text>
    );
  };
  closeModal = () => this.setState({ show: false });
  showModal = () => this.setState({ show: true });

  renderSinglePreselectedItem = () => {
    const { selectedTitleStyle } = this.props;
    let { preSelectedItem } = this.state;
    return (
      <Text
        style={[
          styles.selectedTitlte,
          this.defaultFont,
          selectedTitleStyle,
          { color: "#333" },
        ]}
      >
        {preSelectedItem[0].name}
      </Text>
    );
  };

  renderMultiplePreselectedItems = () => {
    const { onRemoveItem } = this.props;
    let { preSelectedItem } = this.state;
    return (
      <View style={styles.tagWrapper}>
        {preSelectedItem.map((tag, index) => {
          return (
            <TagItem
              key={index}
              onRemoveTag={() => {
                let preSelectedItem = [];
                let selectedIds = [],
                  selectedObjectItems = [];
                let { data } = this.state;
                data.map((item) => {
                  if (item.id === tag.id) {
                    item.checked = false;
                  }
                  if (item.checked) {
                    preSelectedItem.push(item);
                    selectedIds.push(item.id);
                    selectedObjectItems.push(item);
                  }
                });
                this.setState({ data, preSelectedItem });
                onRemoveItem && onRemoveItem(selectedIds, selectedObjectItems);
              }}
              tagName={tag.name}
            />
          );
        })}
      </View>
    );
  };

  renderPreselectedItem = () => {
    const { isSelectSingle } = this.props;
    return isSelectSingle
      ? this.renderSinglePreselectedItem()
      : this.renderMultiplePreselectedItems();
  };

  renderEmptyField = () => {
    const { selectedTitleStyle, title } = this.props;
    return (
      <Text
        style={[styles.selectedTitlte, this.defaultFont, selectedTitleStyle]}
      >
        {title}
      </Text>
    );
  };

  renderSingleSelectedItem = () => {
    const { value, data, selectedTitleStyle } = this.props;
    const selectedItem = data.find((i) => i.id === value[0]);
    if (!selectedItem) return this.renderEmptyField();
    return (
      <Text
        style={[
          styles.selectedTitlte,
          this.defaultFont,
          selectedTitleStyle,
          { color: "black" },
        ]}
      >
        {selectedItem.name}
      </Text>
    );
  };

  renderTextInput = () => {
    const { isSelectSingle, value } = this.props;
    const { preSelectedItem } = this.state;
    if (value && value.length == 1 && isSelectSingle) {
      return this.renderSingleSelectedItem();
    }
    if (preSelectedItem.length > 0) {
      return this.renderPreselectedItem();
    }
    return this.renderEmptyField();
  };

  onItemSelected = (item, isSelectSingle) => {
    let selectedItem = [];
    let { data } = this.state;
    item.checked = !item.checked;
    for (let index in data) {
      if (data[index].id === item.id) {
        data[index] = item;
      } else if (isSelectSingle) {
        data[index].checked = false;
      }
    }
    data.map((item) => {
      if (item.checked) selectedItem.push(item);
    });
    this.setState({ data, selectedItem });
    if (isSelectSingle) {
      this.selectItems(selectedItem);
    }
  };

  onSelectPressed = () => {
    const { selectedItem } = this.state;
    this.selectItems(selectedItem);
  };

  selectItems = (selectedItem) => {
    const { onSelect } = this.props;
    let selectedIds = [],
      selectedObjectItems = [];
    selectedItem.map((item) => {
      selectedIds.push(item.id);
      selectedObjectItems.push(item);
    });
    onSelect && onSelect(selectedIds, selectedObjectItems);
    this.setState({
      show: false,
      keyword: "",
      preSelectedItem: selectedItem,
    });
  };

  searchBoxChanged = (keyword) => {
    const { searchBoxTextChanged } = this.props;
    this.setState({ keyword });
    if (searchBoxTextChanged) searchBoxTextChanged(keyword);
  };

  render() {
    let {
      style,
      modalStyle,
      title,
      popupTitle,
      colorTheme,
      cancelButtonText,
      selectButtonText,
      searchPlaceHolderText,
      buttonTextStyle,
      buttonStyle,
      showSearchBox,
      isSelectSingle,
      value,
    } = this.props;
    let { show } = this.state;
    return (
      <TouchableOpacity
        onPress={this.showModal}
        activeOpacity={0.7}
        style={[styles.container, style]}
      >
        <Modal
          onBackdropPress={this.closeModal}
          style={{
            justifyContent: "flex-end",
            margin: 0,
          }}
          useNativeDriver={true}
          animationInTiming={300}
          animationOutTiming={300}
          hideModalContentWhileAnimating
          isVisible={show}
        >
          <Animated.View
            style={[
              styles.modalContainer,
              modalStyle,
              { height: this.animatedHeight, useNativeDriver: false },
            ]}
          >
            <View>
              <Text
                style={[styles.title, this.defaultFont, { color: colorTheme }]}
              >
                {popupTitle || title}
              </Text>
            </View>
            <View style={styles.line} />
            {showSearchBox ? (
              <TextInput
                underlineColorAndroid="transparent"
                returnKeyType="done"
                style={[styles.inputKeyword, this.defaultFont]}
                placeholder={searchPlaceHolderText}
                selectionColor={colorTheme}
                onChangeText={this.searchBoxChanged}
                onFocus={() => {
                  Animated.spring(this.animatedHeight, {
                    toValue:
                      INIT_HEIGHT + (Platform.OS === "ios" ? height * 0.2 : 0),
                    friction: 7,
                    useNativeDriver: false,
                  }).start();
                }}
                onBlur={() => {
                  Animated.spring(this.animatedHeight, {
                    toValue: INIT_HEIGHT,
                    friction: 7,
                    useNativeDriver: false,
                  }).start();
                }}
              />
            ) : null}
            <FlatList
              style={styles.listOption}
              data={this.dataRender || []}
              keyExtractor={this.keyExtractor}
              renderItem={this.renderItem}
              ListEmptyComponent={this.renderEmpty}
            />

            <View style={styles.buttonWrapper}>
              {!isSelectSingle && (
                <>
                  <Button
                    defaultFont={this.defaultFont}
                    onPress={() => {
                      this.cancelSelection();
                    }}
                    title={cancelButtonText}
                    textColor={colorTheme}
                    backgroundColor="#fff"
                    textStyle={buttonTextStyle}
                    style={[
                      styles.button,
                      buttonStyle,
                      {
                        marginRight: 5,
                        marginLeft: 10,
                        borderWidth: 1,
                        borderColor: colorTheme,
                      },
                    ]}
                  />
                  <Button
                    defaultFont={this.defaultFont}
                    onPress={this.selectItems}
                    title={selectButtonText}
                    backgroundColor={colorTheme}
                    textStyle={buttonTextStyle}
                    style={[
                      styles.button,
                      buttonStyle,
                      { marginLeft: 5, marginRight: 10 },
                    ]}
                  />
                </>
              )}
            </View>
          </Animated.View>
        </Modal>
        {this.renderTextInput()}
      </TouchableOpacity>
    );
  }
}

// define your styles
const styles = StyleSheet.create({
  container: {
    width: "100%",
    minHeight: 45,
    borderRadius: 2,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#cacaca",
    paddingVertical: 4,
  },
  modalContainer: {
    paddingTop: 16,
    backgroundColor: "#fff",
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  title: {
    fontSize: 16,
    marginBottom: 16,
    width: "100%",
    textAlign: "center",
  },
  line: {
    height: 1,
    width: "100%",
    backgroundColor: "#cacaca",
  },
  inputKeyword: {
    height: 40,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#cacaca",
    paddingLeft: 8,
    marginHorizontal: 24,
    marginTop: 16,
  },
  buttonWrapper: {
    marginVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  button: {
    height: 36,
    flex: 1,
  },
  selectedTitlte: {
    fontSize: 14,
    color: "gray",
    flex: 1,
  },
  tagWrapper: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  listOption: {
    paddingHorizontal: 24,
    paddingTop: 1,
    marginTop: 16,
  },
  itemWrapper: {
    borderBottomWidth: 1,
    borderBottomColor: "#eaeaea",
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  itemText: {
    fontSize: 16,
    color: "#333",
    flex: 1,
  },
  itemIcon: {
    width: 30,
    textAlign: "right",
  },
  empty: {
    fontSize: 16,
    color: "gray",
    alignSelf: "center",
    textAlign: "center",
    paddingTop: 16,
  },
});

Select2.propTypes = {
  data: PropTypes.array.isRequired,
  style: PropTypes.object,
  defaultFontName: PropTypes.string,
  selectedTitleStyle: PropTypes.object,
  buttonTextStyle: PropTypes.object,
  buttonStyle: PropTypes.object,
  title: PropTypes.string,
  onSelect: PropTypes.func,
  onRemoveItem: PropTypes.func,
  popupTitle: PropTypes.string,
  colorTheme: PropTypes.string,
  isSelectSingle: PropTypes.bool,
  showSearchBox: PropTypes.bool,
  cancelButtonText: PropTypes.string,
  selectButtonText: PropTypes.string,
};

//make this component available to the app
export default Select2;
