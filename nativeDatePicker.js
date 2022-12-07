class NativeDatePicker extends React.Component {
    constructor(props) {
        super(props);
        this.onChange = this.onChange.bind(this);
        this.onBlur = this.onBlur.bind(this);
    }
    componentWillMount() {
        const model = manywho.model.getComponent(this.props.id, this.props.flowKey);
        if (model && model.attributes && model.attributes.validation) {
            this.validationRegex = new RegExp(model.attributes.validation);
        }
    }
	
	
	renderOutcomesInOrder(element, outcomes, outcomeMeta, isVisible) {
		if ((!outcomes || outcomes.length === 0) || (!outcomeMeta || outcomeMeta.length === 0) || isVisible === false) {
			return element;
		}
		const resultToRender = [element];
		outcomeMeta.forEach((outcome, nativeIndex) => {
			const displayTop = outcome.isBulkAction;
			if (displayTop && nativeIndex === 0) {
				resultToRender.unshift(outcomes[nativeIndex]);
			}
			if (displayTop && nativeIndex > 0) {
				const elementPosition = resultToRender.indexOf(element);
				resultToRender.splice(elementPosition, 0, outcomes[nativeIndex]);
			}
			if (!displayTop) {
				resultToRender.push(outcomes[nativeIndex]);
			}
		});
		return resultToRender;
	};
		
    onChange(e) {
        const model = manywho.model.getComponent(this.props.id, this.props.flowKey);
        if (typeof e === 'string' ||
            typeof e === 'boolean' ||
            typeof e === 'number' ||
            e === null) {
            manywho.state.setComponent(this.props.id, { contentValue: e }, this.props.flowKey, true);
        }
        else {
            manywho.state.setComponent(this.props.id, { contentValue: e.target.value }, this.props.flowKey, true);
        }
        if (model.contentType.toUpperCase() === manywho.component.contentTypes.boolean) {
            this.onBlur(e);
        }
        this.forceUpdate();
    }
    onBlur(e) {
        manywho.component.handleEvent(this, manywho.model.getComponent(this.props.id, this.props.flowKey), this.props.flowKey, null);
    }
    render() {
        const model = manywho.model.getComponent(this.props.id, this.props.flowKey);
        manywho.log.info(`Rendering Input: ${model.developerName}, ${this.props.id}`);
        const state = manywho.state.getComponent(this.props.id, this.props.flowKey) || {};
        const outcomes = manywho.model.getOutcomes(this.props.id, this.props.flowKey);

        const Outcome = manywho.component.getByName('outcome');
        const cv = !manywho.utils.isNullOrUndefined(state.contentValue)
            ? state.contentValue
            : model.contentValue || '';
			
		const contentValue = cv.split("T")[0];
			
		// '.split("T")[0]' appended to fix formatting for Date/Time values
        
		let mask = null;
        if (model.attributes && model.attributes.mask) {
            mask = model.attributes.mask;
        }
        let autocomplete = null;
        if (model.attributes && model.attributes.autocomplete) {
            autocomplete = model.attributes.autocomplete;
        }
				
        const props = {
            mask,
            value: contentValue,
            id: this.props.id,
            maxLength: model.maxSize,
            size: mask ? mask.length : model.size,
            readOnly: model.isEditable === false,
            disabled: model.isEnabled === false,
            required: model.isRequired === true,
            onChange: this.onChange,
            onBlur: this.onBlur,
            flowKey: this.props.flowKey,
            format: model.contentFormat,
            autoComplete: autocomplete,
            autoFocus: model.autoFocus,
        };
		
		if (model.attributes && (parseInt(model.attributes.minDays) >= 0)){			
			let dmin = new Date()
			dmin.setDate(dmin.getDate() - parseInt(model.attributes.minDays));
			props.min = 
				dmin.getFullYear() 
				+ "-" 
				+ (dmin.getMonth()+1).toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping:false}) 
				+ "-" 
				+ dmin.getDate().toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping:false});
		}
		if (model.attributes && (parseInt(model.attributes.maxDays) >= 0)){
			let dmax = new Date()
			dmax.setDate(dmax.getDate() + parseInt(model.attributes.maxDays));
			console.log(dmax);
			props.max = 
				dmax.getFullYear() 
				+ "-"
				+ (dmax.getMonth()+1).toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping:false}) 
				+ "-" 
				+ dmax.getDate().toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping:false});
		}
		
        if (this.props.isDesignTime) {
            props.onChange = null;
            props.onBlur = null;
            props.isDesignTime = true;
        }
        if (typeof model.hintValue === 'number' || !manywho.utils.isNullOrWhitespace(model.hintValue)) {
            props.placeholder = model.hintValue;
        }
        let className = manywho.styling.getClasses(this.props.parentId, this.props.id, 'input', this.props.flowKey).join(' ');
        if (model.isValid === false || state.isValid === false) {
            className += ' has-error';
        }
        if (model.isVisible === false) {
            className += ' hidden';
        }
        if (outcomes) {
            className += ' has-outcomes';
        }
        className += ' form-group';
        let contentType = model.contentType || 'ContentString';
        if (model.valueElementValueBindingReferenceId) {
            if (model.valueElementValueBindingReferenceId.contentType) {
                contentType = model.valueElementValueBindingReferenceId.contentType;
            }
            else if (Array.isArray(model.valueElementValueBindingReferenceId) &&
                model.valueElementValueBindingReferenceId.length > 0 &&
                model.valueElementValueBindingReferenceId[0].properties) {
                contentType = (manywho.utils.getObjectDataProperty(model.valueElementValueBindingReferenceId[0].properties, 'ContentType') || {}).contentValue;
            }
        }
        const isRequired = typeof model.isRequired === 'string' ?
            manywho.utils.isEqual(model.isRequired, 'True', true) :
            model.isRequired;
        let label = (React.createElement("label", null,
            model.label,
            isRequired ? React.createElement("span", { className: "input-required" }, " *") : null));
			
		console.log(this, model)
			
        let inputElement = (React.createElement("input", Object.assign({}, props, { type: 'date' })));
        
        const outcomeButtons = outcomes && outcomes.map(outcome => React.createElement(Outcome, { key: outcome.id, id: outcome.id, flowKey: this.props.flowKey }));
        const inputField = (React.createElement("div", { key: "" },
            label,
			React.createElement("p", {style: {margin: 0}}),
            inputElement,
            React.createElement("span", { className: "help-block" }, model.validationMessage || state.validationMessage),
            React.createElement("span", { className: "help-block" }, model.helpInfo)));
        return (React.createElement("div", { className: className }, this.renderOutcomesInOrder(inputField, outcomeButtons, outcomes, model.isVisible)));
    }
}
manywho.component.register("nativedatepicker", NativeDatePicker);
