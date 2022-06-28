import React from 'react'
import PropTypes from 'prop-types'
import Modal from '../../../commons/components/Modal'
import CheckList from '../../../commons/components/CheckList'
import FlatButton from '../../../commons/components/FlatButton'
import Input from '../../../commons/components/Input'
import Fuse from 'fuse.js'
import './style.css'

export default class VisualGridOptionSelector extends React.Component {
  static propTypes = {
    modalIsOpen: PropTypes.bool.isRequired,
    modalClose: PropTypes.func.isRequired,
    options: PropTypes.array.isRequired,
    selectedOptions: PropTypes.array.isRequired,
    onSubmit: PropTypes.func.isRequired,
    customStyles: PropTypes.object.isRequired,
    isSearch: PropTypes.bool,
    isMobile: PropTypes.bool,
  }

  constructor(props) {
    super(props)
    this.state = {
      selectedOptions: [...this.props.selectedOptions],
    }
  }

  componentDidUpdate(prevProps) {
    // NOTE:
    // Refreshing the state since it is passed throught props and is altered
    // in the parent component. Also because when the user closes the window
    // we discard the state, but selections from the parent component need to
    // persist into this window.
    if (
      prevProps.selectedOptions !== this.props.selectedOptions ||
      (!prevProps.modalIsOpen && this.props.modalIsOpen)
    ) {
      this.setState({ selectedOptions: [...this.props.selectedOptions] })
      this.setState({ searchResults: undefined })
    }
  }

  close() {
    this.setState({ ['selectedOptions']: [] })
    this.props.modalClose()
  }

  handleOptionChange(option, event) {
    if (event && event.target.checked) {
      if (!this.isOptionSelected(option)) {
        this.setState({
          ['selectedOptions']: [...this.state.selectedOptions, option],
        })
      }
    } else {
      this.setState({
        ['selectedOptions']: this.state.selectedOptions.filter(selectedOption => selectedOption !== option),
      })
    }
  }

  isOptionSelected(option) {
    return !!this.state.selectedOptions.find(selectedOption => selectedOption === option)
  }

  onSubmit() {
    this.props.onSubmit(this.state.selectedOptions)
    this.props.modalClose()
  }

  search(pattern) {
    const fuse = new Fuse(this.props.options, {
      shouldSort: false,
      includeMatches: true,
      threshold: 0.3,
      location: 0,
      distance: 100,
      maxPatternLength: 20,
      minMatchCharLength: 1,
      keys: this.props.isMobile ? ['name'] : undefined,
    })
    const result = fuse.search(pattern).map(r => r.item)
    this.setState({
      searchResults: pattern ? result : undefined,
    })
  }

  render() {
    return (
      <Modal
        customStyles={this.props.customStyles}
        modalIsOpen={this.props.modalIsOpen}
        onRequestClose={this.close.bind(this)}
      >
        <div className="selections">
          {this.props.isSearch ? (
            <Input onChange={this.search.bind(this)} name="" label="" placeholder="Search" autoFocus />
          ) : (
            undefined
          )}
          {this.props.isMobile ? (
            <React.Fragment>
              <div className="selector">
                <h4>Chrome Emulation</h4>
                <CheckList
                  items={
                    this.state.searchResults
                      ? this.state.searchResults.filter(option => option.type === 'emulator')
                      : this.props.options.filter(option => option.type === 'emulator')
                  }
                  optionSelected={this.isOptionSelected.bind(this)}
                  handleOptionChange={this.handleOptionChange.bind(this)}
                />
              </div>
              <div className="selector">
                <h4>iOS Simulation</h4>
                <CheckList
                  items={
                    this.state.searchResults
                      ? this.state.searchResults.filter(option => option.type === 'simulator')
                      : this.props.options.filter(option => option.type === 'simulator')
                  }
                  optionSelected={this.isOptionSelected.bind(this)}
                  handleOptionChange={this.handleOptionChange.bind(this)}
                />
              </div>
            </React.Fragment>
          ) : (
            <div className="selector">
              <CheckList
                items={this.state.searchResults ? this.state.searchResults : this.props.options}
                optionSelected={this.isOptionSelected.bind(this)}
                handleOptionChange={this.handleOptionChange.bind(this)}
              />
            </div>
          )}
        </div>
        <FlatButton className="confirm" type="submit" onClick={this.onSubmit.bind(this)}>
          Confirm
        </FlatButton>
      </Modal>
    )
  }
}
