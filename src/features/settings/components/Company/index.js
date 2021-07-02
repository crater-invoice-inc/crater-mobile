// @flow

import React from 'react';
import { View } from 'react-native';
import styles from './styles';
import {
    DefaultLayout,
    InputField,
    FilePicker,
    SelectField,
    ActionButton
} from '@/components';
import { Field, change } from 'redux-form';
import Lng from '@/lang/i18n';
import { EDIT_COMPANY } from '../../constants';
import { formatCountries } from '@/utils';
import { MAX_LENGTH } from '@/constants';
import { goBack, MOUNT, UNMOUNT } from '@/navigation';

type IProps = {
    navigation: Object,
    getCompanyInformation: Function,
    getCountries: Function,
    editCompanyInformation: Function,
    handleSubmit: Function,
    locale: String,
    editCompanyLoading: Boolean,
    getCompanyInfoLoading: Boolean,
    countriesLoading: Boolean
};

let companyField = [
    'country_id',
    'state',
    'city',
    'zip',
    'address_street_1',
    'address_street_2',
    'phone'
];

export class Company extends React.Component<IProps> {
    constructor(props) {
        super(props);

        this.state = {
            image: null,
            logo: null,
            fileLoading: false
        };
    }

    componentDidMount() {
        const {
            getCompanyInformation,
            getCountries,
            navigation,
            countries
        } = this.props;

        let hasCountryApiCalled = countries
            ? typeof countries === 'undefined' || countries.length === 0
            : true;

        hasCountryApiCalled && getCountries();

        getCompanyInformation({
            onResult: user => {
                this.setFormField(
                    'name',
                    user.company_id ? user.company.name : ''
                );

                if (user.company.address) {
                    companyField.map(field => {
                        this.setFormField(field, user.company.address[field]);
                    });
                }
                if (user.company.logo) {
                    this.setState({ image: user.company.logo });
                }
            }
        });
        goBack(MOUNT, navigation);
    }

    componentWillUnmount() {
        goBack(UNMOUNT);
    }

    setFormField = (field, value) => {
        this.props.dispatch(change(EDIT_COMPANY, field, value));
    };

    onCompanyUpdate = value => {
        const {
            navigation,
            editCompanyInformation,
            editCompanyLoading,
            getCompanyInfoLoading,
            countriesLoading
        } = this.props;
        const { logo, fileLoading } = this.state;

        if (
            getCompanyInfoLoading ||
            countriesLoading ||
            fileLoading ||
            editCompanyLoading
        ) {
            return;
        }

        editCompanyInformation({
            params: value,
            logo,
            navigation
        });
    };

    render() {
        const {
            navigation,
            handleSubmit,
            locale,
            getCompanyInfoLoading,
            countriesLoading,
            editCompanyLoading,
            isAllowToEdit,
            countries
        } = this.props;

        const { fileLoading } = this.state;
        let companyRefs = {};
        const disabled = !isAllowToEdit;

        const bottomAction = [
            {
                label: 'button.save',
                onPress: handleSubmit(this.onCompanyUpdate),
                show: isAllowToEdit,
                loading:
                    editCompanyLoading ||
                    fileLoading ||
                    getCompanyInfoLoading ||
                    countriesLoading
            }
        ];

        return (
            <DefaultLayout
                headerProps={{
                    leftIconPress: () => navigation.goBack(null),
                    title: Lng.t('header.setting.company', { locale }),
                    withTitleStyle: styles.titleStyle,
                    placement: 'center',
                    ...(isAllowToEdit && {
                        rightIcon: 'save',
                        rightIconProps: { solid: true },
                        rightIconPress: handleSubmit(this.onCompanyUpdate)
                    })
                }}
                bottomAction={
                    <ActionButton locale={locale} buttons={bottomAction} />
                }
                loadingProps={{
                    is: getCompanyInfoLoading || countriesLoading
                }}
            >
                <View style={styles.mainContainer}>
                    <Field
                        name={'logo'}
                        component={FilePicker}
                        locale={locale}
                        label={Lng.t('settings.company.logo', { locale })}
                        onChangeCallback={val => this.setState({ logo: val })}
                        uploadedFileUrl={this.state.image}
                        disabled={disabled}
                        containerStyle={{
                            marginTop: 15,
                            marginBottom: 5
                        }}
                        fileLoading={val => {
                            this.setState({ fileLoading: val });
                        }}
                    />

                    <Field
                        name={'name'}
                        component={InputField}
                        isRequired
                        hint={Lng.t('settings.company.name', { locale })}
                        disabled={disabled}
                        inputProps={{
                            returnKeyType: 'next',
                            autoCorrect: true,
                            onFocus: true,
                            onSubmitEditing: () => {
                                companyRefs.phone.focus();
                            }
                        }}
                    />

                    <Field
                        name={'phone'}
                        component={InputField}
                        hint={Lng.t('settings.company.phone', { locale })}
                        disabled={disabled}
                        inputProps={{
                            returnKeyType: 'next',
                            keyboardType: 'phone-pad'
                        }}
                        refLinkFn={ref => {
                            companyRefs.phone = ref;
                        }}
                    />

                    <Field
                        name={'country_id'}
                        items={formatCountries(countries)}
                        displayName="name"
                        component={SelectField}
                        label={Lng.t('customers.address.country', { locale })}
                        placeholder={' '}
                        rightIcon="angle-right"
                        navigation={navigation}
                        searchFields={['name']}
                        isInternalSearch
                        compareField="id"
                        onSelect={({ id }) => {
                            this.setFormField('country_id', id);
                        }}
                        headerProps={{
                            title: Lng.t('header.country', { locale }),
                            rightIconPress: null
                        }}
                        listViewProps={{
                            contentContainerStyle: { flex: 7 }
                        }}
                        emptyContentProps={{
                            contentType: 'countries'
                        }}
                        fakeInputProps={{ disabled }}
                        isEditable={!disabled}
                        isRequired
                    />

                    <Field
                        name={'state'}
                        component={InputField}
                        hint={Lng.t('customers.address.state', { locale })}
                        disabled={disabled}
                        inputProps={{
                            returnKeyType: 'next',
                            autoCapitalize: 'none',
                            autoCorrect: true,
                            onSubmitEditing: () => {
                                companyRefs.city.focus();
                            }
                        }}
                    />

                    <Field
                        name={'city'}
                        component={InputField}
                        hint={Lng.t('customers.address.city', { locale })}
                        disabled={disabled}
                        inputProps={{
                            returnKeyType: 'next',
                            autoCapitalize: 'none',
                            autoCorrect: true,
                            onSubmitEditing: () => {
                                companyRefs.street1.focus();
                            }
                        }}
                        refLinkFn={ref => {
                            companyRefs.city = ref;
                        }}
                    />

                    <Field
                        name={'address_street_1'}
                        component={InputField}
                        hint={Lng.t('settings.company.address', { locale })}
                        disabled={disabled}
                        height={60}
                        autoCorrect={true}
                        refLinkFn={ref => {
                            companyRefs.street1 = ref;
                        }}
                        inputProps={{
                            returnKeyType: 'next',
                            placeholder: Lng.t('settings.company.street1', {
                                locale
                            }),
                            autoCorrect: true,
                            multiline: true,
                            maxLength: MAX_LENGTH
                        }}
                    />

                    <Field
                        name={'address_street_2'}
                        component={InputField}
                        disabled={disabled}
                        height={60}
                        autoCorrect={true}
                        containerStyle={styles.addressStreetField}
                        inputProps={{
                            returnKeyType: 'next',
                            autoCapitalize: 'none',
                            placeholder: Lng.t('settings.company.street2', {
                                locale
                            }),
                            autoCorrect: true,
                            multiline: true,
                            maxLength: MAX_LENGTH
                        }}
                    />

                    <Field
                        name={'zip'}
                        component={InputField}
                        hint={Lng.t('settings.company.zipcode', { locale })}
                        disabled={disabled}
                        inputProps={{
                            returnKeyType: 'next',
                            autoCapitalize: 'none',
                            onSubmitEditing: handleSubmit(this.onCompanyUpdate)
                        }}
                    />

                    <View style={{ marginBottom: 20 }} />
                </View>
            </DefaultLayout>
        );
    }
}
