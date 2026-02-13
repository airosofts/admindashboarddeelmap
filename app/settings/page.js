"use client";

import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import {
  Settings, User, Lock, Globe, Image as ImageIcon, Save, Eye, EyeOff,
  Upload, X, Check, AlertCircle, Building2, Mail, MapPin,
  Calendar, Clock, Percent, FileText, CreditCard, Search, ChevronDown
} from 'lucide-react';
import { motion } from 'framer-motion';

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState(null);
  const [settings, setSettings] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [userId, setUserId] = useState(null);

  // Profile form state (based on users schema)
  const [profileForm, setProfileForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    dob: '',
    country: '',
    city: '',
    address: ''
  });

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  // Settings form state (based on settings schema)
  const [settingsForm, setSettingsForm] = useState({
    name: '',
    logo: '',
    address: '',
    email: '',
    phone: '',
    fax: '',
    footer_text: '',
    default_currency: 'USD',
    default_date_format: 'MM/DD/YYYY',
    timezone: 'UTC',
    minimum_booking: 1,
    advance_payment: 0,
    taxes: 0
  });

  // Logo upload state
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');
  const [uploadingLogo, setUploadingLogo] = useState(false);

  // Searchable dropdown states
  const [currencySearch, setCurrencySearch] = useState('');
  const [timezoneSearch, setTimezoneSearch] = useState('');
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);
  const [showTimezoneDropdown, setShowTimezoneDropdown] = useState(false);
  const currencyDropdownRef = useRef(null);
  const timezoneDropdownRef = useRef(null);

  const currencies = [
    { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ' },
    { code: 'AFN', name: 'Afghan Afghani', symbol: '؋' },
    { code: 'ALL', name: 'Albanian Lek', symbol: 'L' },
    { code: 'AMD', name: 'Armenian Dram', symbol: '֏' },
    { code: 'ANG', name: 'Netherlands Antillean Guilder', symbol: 'ƒ' },
    { code: 'AOA', name: 'Angolan Kwanza', symbol: 'Kz' },
    { code: 'ARS', name: 'Argentine Peso', symbol: '$' },
    { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
    { code: 'AWG', name: 'Aruban Florin', symbol: 'ƒ' },
    { code: 'AZN', name: 'Azerbaijani Manat', symbol: '₼' },
    { code: 'BAM', name: 'Bosnia-Herzegovina Convertible Mark', symbol: 'KM' },
    { code: 'BBD', name: 'Barbadian Dollar', symbol: '$' },
    { code: 'BDT', name: 'Bangladeshi Taka', symbol: '৳' },
    { code: 'BGN', name: 'Bulgarian Lev', symbol: 'лв' },
    { code: 'BHD', name: 'Bahraini Dinar', symbol: '.د.ب' },
    { code: 'BIF', name: 'Burundian Franc', symbol: 'Fr' },
    { code: 'BMD', name: 'Bermudan Dollar', symbol: '$' },
    { code: 'BND', name: 'Brunei Dollar', symbol: '$' },
    { code: 'BOB', name: 'Bolivian Boliviano', symbol: 'Bs.' },
    { code: 'BRL', name: 'Brazilian Real', symbol: 'R$' },
    { code: 'BSD', name: 'Bahamian Dollar', symbol: '$' },
    { code: 'BTN', name: 'Bhutanese Ngultrum', symbol: 'Nu.' },
    { code: 'BWP', name: 'Botswanan Pula', symbol: 'P' },
    { code: 'BYN', name: 'Belarusian Ruble', symbol: 'Br' },
    { code: 'BZD', name: 'Belize Dollar', symbol: '$' },
    { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
    { code: 'CDF', name: 'Congolese Franc', symbol: 'Fr' },
    { code: 'CHF', name: 'Swiss Franc', symbol: 'Fr' },
    { code: 'CLP', name: 'Chilean Peso', symbol: '$' },
    { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
    { code: 'COP', name: 'Colombian Peso', symbol: '$' },
    { code: 'CRC', name: 'Costa Rican Colón', symbol: '₡' },
    { code: 'CUP', name: 'Cuban Peso', symbol: '$' },
    { code: 'CVE', name: 'Cape Verdean Escudo', symbol: '$' },
    { code: 'CZK', name: 'Czech Koruna', symbol: 'Kč' },
    { code: 'DJF', name: 'Djiboutian Franc', symbol: 'Fr' },
    { code: 'DKK', name: 'Danish Krone', symbol: 'kr' },
    { code: 'DOP', name: 'Dominican Peso', symbol: '$' },
    { code: 'DZD', name: 'Algerian Dinar', symbol: 'د.ج' },
    { code: 'EGP', name: 'Egyptian Pound', symbol: '£' },
    { code: 'ERN', name: 'Eritrean Nakfa', symbol: 'Nfk' },
    { code: 'ETB', name: 'Ethiopian Birr', symbol: 'Br' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'FJD', name: 'Fijian Dollar', symbol: '$' },
    { code: 'FKP', name: 'Falkland Islands Pound', symbol: '£' },
    { code: 'FOK', name: 'Faroese Króna', symbol: 'kr' },
    { code: 'GBP', name: 'British Pound', symbol: '£' },
    { code: 'GEL', name: 'Georgian Lari', symbol: '₾' },
    { code: 'GGP', name: 'Guernsey Pound', symbol: '£' },
    { code: 'GHS', name: 'Ghanaian Cedi', symbol: '₵' },
    { code: 'GIP', name: 'Gibraltar Pound', symbol: '£' },
    { code: 'GMD', name: 'Gambian Dalasi', symbol: 'D' },
    { code: 'GNF', name: 'Guinean Franc', symbol: 'Fr' },
    { code: 'GTQ', name: 'Guatemalan Quetzal', symbol: 'Q' },
    { code: 'GYD', name: 'Guyanaese Dollar', symbol: '$' },
    { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$' },
    { code: 'HNL', name: 'Honduran Lempira', symbol: 'L' },
    { code: 'HRK', name: 'Croatian Kuna', symbol: 'kn' },
    { code: 'HTG', name: 'Haitian Gourde', symbol: 'G' },
    { code: 'HUF', name: 'Hungarian Forint', symbol: 'Ft' },
    { code: 'IDR', name: 'Indonesian Rupiah', symbol: 'Rp' },
    { code: 'ILS', name: 'Israeli New Shekel', symbol: '₪' },
    { code: 'IMP', name: 'Manx Pound', symbol: '£' },
    { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
    { code: 'IQD', name: 'Iraqi Dinar', symbol: 'ع.د' },
    { code: 'IRR', name: 'Iranian Rial', symbol: '﷼' },
    { code: 'ISK', name: 'Icelandic Króna', symbol: 'kr' },
    { code: 'JEP', name: 'Jersey Pound', symbol: '£' },
    { code: 'JMD', name: 'Jamaican Dollar', symbol: '$' },
    { code: 'JOD', name: 'Jordanian Dinar', symbol: 'د.ا' },
    { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
    { code: 'KES', name: 'Kenyan Shilling', symbol: 'Sh' },
    { code: 'KGS', name: 'Kyrgystani Som', symbol: 'с' },
    { code: 'KHR', name: 'Cambodian Riel', symbol: '៛' },
    { code: 'KID', name: 'Kiribati Dollar', symbol: '$' },
    { code: 'KMF', name: 'Comorian Franc', symbol: 'Fr' },
    { code: 'KRW', name: 'South Korean Won', symbol: '₩' },
    { code: 'KWD', name: 'Kuwaiti Dinar', symbol: 'د.ك' },
    { code: 'KYD', name: 'Cayman Islands Dollar', symbol: '$' },
    { code: 'KZT', name: 'Kazakhstani Tenge', symbol: '₸' },
    { code: 'LAK', name: 'Laotian Kip', symbol: '₭' },
    { code: 'LBP', name: 'Lebanese Pound', symbol: 'ل.ل' },
    { code: 'LKR', name: 'Sri Lankan Rupee', symbol: 'Rs' },
    { code: 'LRD', name: 'Liberian Dollar', symbol: '$' },
    { code: 'LSL', name: 'Lesotho Loti', symbol: 'L' },
    { code: 'LYD', name: 'Libyan Dinar', symbol: 'ل.د' },
    { code: 'MAD', name: 'Moroccan Dirham', symbol: 'د.م.' },
    { code: 'MDL', name: 'Moldovan Leu', symbol: 'L' },
    { code: 'MGA', name: 'Malagasy Ariary', symbol: 'Ar' },
    { code: 'MKD', name: 'Macedonian Denar', symbol: 'ден' },
    { code: 'MMK', name: 'Myanmar Kyat', symbol: 'K' },
    { code: 'MNT', name: 'Mongolian Tugrik', symbol: '₮' },
    { code: 'MOP', name: 'Macanese Pataca', symbol: 'P' },
    { code: 'MRU', name: 'Mauritanian Ouguiya', symbol: 'UM' },
    { code: 'MUR', name: 'Mauritian Rupee', symbol: '₨' },
    { code: 'MVR', name: 'Maldivian Rufiyaa', symbol: '.ރ' },
    { code: 'MWK', name: 'Malawian Kwacha', symbol: 'MK' },
    { code: 'MXN', name: 'Mexican Peso', symbol: '$' },
    { code: 'MYR', name: 'Malaysian Ringgit', symbol: 'RM' },
    { code: 'MZN', name: 'Mozambican Metical', symbol: 'MT' },
    { code: 'NAD', name: 'Namibian Dollar', symbol: '$' },
    { code: 'NGN', name: 'Nigerian Naira', symbol: '₦' },
    { code: 'NIO', name: 'Nicaraguan Córdoba', symbol: 'C$' },
    { code: 'NOK', name: 'Norwegian Krone', symbol: 'kr' },
    { code: 'NPR', name: 'Nepalese Rupee', symbol: '₨' },
    { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$' },
    { code: 'OMR', name: 'Omani Rial', symbol: 'ر.ع.' },
    { code: 'PAB', name: 'Panamanian Balboa', symbol: 'B/.' },
    { code: 'PEN', name: 'Peruvian Sol', symbol: 'S/.' },
    { code: 'PGK', name: 'Papua New Guinean Kina', symbol: 'K' },
    { code: 'PHP', name: 'Philippine Peso', symbol: '₱' },
    { code: 'PKR', name: 'Pakistani Rupee', symbol: '₨' },
    { code: 'PLN', name: 'Polish Zloty', symbol: 'zł' },
    { code: 'PYG', name: 'Paraguayan Guarani', symbol: '₲' },
    { code: 'QAR', name: 'Qatari Rial', symbol: 'ر.ق' },
    { code: 'RON', name: 'Romanian Leu', symbol: 'lei' },
    { code: 'RSD', name: 'Serbian Dinar', symbol: 'дин' },
    { code: 'RUB', name: 'Russian Ruble', symbol: '₽' },
    { code: 'RWF', name: 'Rwandan Franc', symbol: 'Fr' },
    { code: 'SAR', name: 'Saudi Riyal', symbol: '﷼' },
    { code: 'SBD', name: 'Solomon Islands Dollar', symbol: '$' },
    { code: 'SCR', name: 'Seychellois Rupee', symbol: '₨' },
    { code: 'SDG', name: 'Sudanese Pound', symbol: '£' },
    { code: 'SEK', name: 'Swedish Krona', symbol: 'kr' },
    { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$' },
    { code: 'SHP', name: 'Saint Helena Pound', symbol: '£' },
    { code: 'SLE', name: 'Sierra Leonean Leone', symbol: 'Le' },
    { code: 'SOS', name: 'Somali Shilling', symbol: 'Sh' },
    { code: 'SPL', name: 'Seborgan Luigino', symbol: 'L' },
    { code: 'SRD', name: 'Surinamese Dollar', symbol: '$' },
    { code: 'STN', name: 'São Tomé and Príncipe Dobra', symbol: 'Db' },
    { code: 'SYP', name: 'Syrian Pound', symbol: '£' },
    { code: 'SZL', name: 'Swazi Lilangeni', symbol: 'L' },
    { code: 'THB', name: 'Thai Baht', symbol: '฿' },
    { code: 'TJS', name: 'Tajikistani Somoni', symbol: 'ЅМ' },
    { code: 'TMT', name: 'Turkmenistani Manat', symbol: 'm' },
    { code: 'TND', name: 'Tunisian Dinar', symbol: 'د.ت' },
    { code: 'TOP', name: 'Tongan Paʻanga', symbol: 'T$' },
    { code: 'TRY', name: 'Turkish Lira', symbol: '₺' },
    { code: 'TTD', name: 'Trinidad and Tobago Dollar', symbol: '$' },
    { code: 'TVD', name: 'Tuvaluan Dollar', symbol: '$' },
    { code: 'TWD', name: 'New Taiwan Dollar', symbol: 'NT$' },
    { code: 'TZS', name: 'Tanzanian Shilling', symbol: 'Sh' },
    { code: 'UAH', name: 'Ukrainian Hryvnia', symbol: '₴' },
    { code: 'UGX', name: 'Ugandan Shilling', symbol: 'Sh' },
    { code: 'USD', name: 'US Dollar', symbol: '$' },
    { code: 'UYU', name: 'Uruguayan Peso', symbol: '$' },
    { code: 'UZS', name: 'Uzbekistan Som', symbol: 'so\'m' },
    { code: 'VES', name: 'Venezuelan Bolívar', symbol: 'Bs.' },
    { code: 'VND', name: 'Vietnamese Dong', symbol: '₫' },
    { code: 'VUV', name: 'Vanuatu Vatu', symbol: 'Vt' },
    { code: 'WST', name: 'Samoan Tala', symbol: 'T' },
    { code: 'XAF', name: 'Central African CFA Franc', symbol: 'Fr' },
    { code: 'XCD', name: 'East Caribbean Dollar', symbol: '$' },
    { code: 'XDR', name: 'Special Drawing Rights', symbol: 'SDR' },
    { code: 'XOF', name: 'West African CFA Franc', symbol: 'Fr' },
    { code: 'XPF', name: 'CFP Franc', symbol: 'Fr' },
    { code: 'YER', name: 'Yemeni Rial', symbol: '﷼' },
    { code: 'ZAR', name: 'South African Rand', symbol: 'R' },
    { code: 'ZMW', name: 'Zambian Kwacha', symbol: 'ZK' },
    { code: 'ZWL', name: 'Zimbabwean Dollar', symbol: '$' }
  ];

  const dateFormats = [
    { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
    { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
    { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' },
    { value: 'DD-MM-YYYY', label: 'DD-MM-YYYY' }
  ];

  const timezones = [
    { value: 'UTC', label: 'UTC' },
    { value: 'Africa/Abidjan', label: 'Abidjan' },
    { value: 'Africa/Accra', label: 'Accra' },
    { value: 'Africa/Addis_Ababa', label: 'Addis Ababa' },
    { value: 'Africa/Algiers', label: 'Algiers' },
    { value: 'Africa/Asmara', label: 'Asmara' },
    { value: 'Africa/Bamako', label: 'Bamako' },
    { value: 'Africa/Bangui', label: 'Bangui' },
    { value: 'Africa/Banjul', label: 'Banjul' },
    { value: 'Africa/Bissau', label: 'Bissau' },
    { value: 'Africa/Blantyre', label: 'Blantyre' },
    { value: 'Africa/Brazzaville', label: 'Brazzaville' },
    { value: 'Africa/Bujumbura', label: 'Bujumbura' },
    { value: 'Africa/Cairo', label: 'Cairo' },
    { value: 'Africa/Casablanca', label: 'Casablanca' },
    { value: 'Africa/Ceuta', label: 'Ceuta' },
    { value: 'Africa/Conakry', label: 'Conakry' },
    { value: 'Africa/Dakar', label: 'Dakar' },
    { value: 'Africa/Dar_es_Salaam', label: 'Dar es Salaam' },
    { value: 'Africa/Djibouti', label: 'Djibouti' },
    { value: 'Africa/Douala', label: 'Douala' },
    { value: 'Africa/El_Aaiun', label: 'El Aaiun' },
    { value: 'Africa/Freetown', label: 'Freetown' },
    { value: 'Africa/Gaborone', label: 'Gaborone' },
    { value: 'Africa/Harare', label: 'Harare' },
    { value: 'Africa/Johannesburg', label: 'Johannesburg' },
    { value: 'Africa/Juba', label: 'Juba' },
    { value: 'Africa/Kampala', label: 'Kampala' },
    { value: 'Africa/Khartoum', label: 'Khartoum' },
    { value: 'Africa/Kigali', label: 'Kigali' },
    { value: 'Africa/Kinshasa', label: 'Kinshasa' },
    { value: 'Africa/Lagos', label: 'Lagos' },
    { value: 'Africa/Libreville', label: 'Libreville' },
    { value: 'Africa/Lome', label: 'Lome' },
    { value: 'Africa/Luanda', label: 'Luanda' },
    { value: 'Africa/Lubumbashi', label: 'Lubumbashi' },
    { value: 'Africa/Lusaka', label: 'Lusaka' },
    { value: 'Africa/Malabo', label: 'Malabo' },
    { value: 'Africa/Maputo', label: 'Maputo' },
    { value: 'Africa/Maseru', label: 'Maseru' },
    { value: 'Africa/Mbabane', label: 'Mbabane' },
    { value: 'Africa/Mogadishu', label: 'Mogadishu' },
    { value: 'Africa/Monrovia', label: 'Monrovia' },
    { value: 'Africa/Nairobi', label: 'Nairobi' },
    { value: 'Africa/Ndjamena', label: 'Ndjamena' },
    { value: 'Africa/Niamey', label: 'Niamey' },
    { value: 'Africa/Nouakchott', label: 'Nouakchott' },
    { value: 'Africa/Ouagadougou', label: 'Ouagadougou' },
    { value: 'Africa/Porto-Novo', label: 'Porto-Novo' },
    { value: 'Africa/Sao_Tome', label: 'Sao Tome' },
    { value: 'Africa/Tripoli', label: 'Tripoli' },
    { value: 'Africa/Tunis', label: 'Tunis' },
    { value: 'Africa/Windhoek', label: 'Windhoek' },
    { value: 'America/Adak', label: 'Adak' },
    { value: 'America/Anchorage', label: 'Anchorage' },
    { value: 'America/Anguilla', label: 'Anguilla' },
    { value: 'America/Antigua', label: 'Antigua' },
    { value: 'America/Araguaina', label: 'Araguaina' },
    { value: 'America/Argentina/Buenos_Aires', label: 'Buenos Aires' },
    { value: 'America/Argentina/Catamarca', label: 'Catamarca' },
    { value: 'America/Argentina/Cordoba', label: 'Cordoba' },
    { value: 'America/Argentina/Jujuy', label: 'Jujuy' },
    { value: 'America/Argentina/La_Rioja', label: 'La Rioja' },
    { value: 'America/Argentina/Mendoza', label: 'Mendoza' },
    { value: 'America/Argentina/Rio_Gallegos', label: 'Rio Gallegos' },
    { value: 'America/Argentina/Salta', label: 'Salta' },
    { value: 'America/Argentina/San_Juan', label: 'San Juan' },
    { value: 'America/Argentina/San_Luis', label: 'San Luis' },
    { value: 'America/Argentina/Tucuman', label: 'Tucuman' },
    { value: 'America/Argentina/Ushuaia', label: 'Ushuaia' },
    { value: 'America/Aruba', label: 'Aruba' },
    { value: 'America/Asuncion', label: 'Asuncion' },
    { value: 'America/Atikokan', label: 'Atikokan' },
    { value: 'America/Bahia', label: 'Bahia' },
    { value: 'America/Bahia_Banderas', label: 'Bahia Banderas' },
    { value: 'America/Barbados', label: 'Barbados' },
    { value: 'America/Belem', label: 'Belem' },
    { value: 'America/Belize', label: 'Belize' },
    { value: 'America/Blanc-Sablon', label: 'Blanc-Sablon' },
    { value: 'America/Boa_Vista', label: 'Boa Vista' },
    { value: 'America/Bogota', label: 'Bogota' },
    { value: 'America/Boise', label: 'Boise' },
    { value: 'America/Cambridge_Bay', label: 'Cambridge Bay' },
    { value: 'America/Campo_Grande', label: 'Campo Grande' },
    { value: 'America/Cancun', label: 'Cancun' },
    { value: 'America/Caracas', label: 'Caracas' },
    { value: 'America/Cayenne', label: 'Cayenne' },
    { value: 'America/Cayman', label: 'Cayman' },
    { value: 'America/Chicago', label: 'Chicago' },
    { value: 'America/Chihuahua', label: 'Chihuahua' },
    { value: 'America/Costa_Rica', label: 'Costa Rica' },
    { value: 'America/Creston', label: 'Creston' },
    { value: 'America/Cuiaba', label: 'Cuiaba' },
    { value: 'America/Curacao', label: 'Curacao' },
    { value: 'America/Danmarkshavn', label: 'Danmarkshavn' },
    { value: 'America/Dawson', label: 'Dawson' },
    { value: 'America/Dawson_Creek', label: 'Dawson Creek' },
    { value: 'America/Denver', label: 'Denver' },
    { value: 'America/Detroit', label: 'Detroit' },
    { value: 'America/Dominica', label: 'Dominica' },
    { value: 'America/Edmonton', label: 'Edmonton' },
    { value: 'America/Eirunepe', label: 'Eirunepe' },
    { value: 'America/El_Salvador', label: 'El Salvador' },
    { value: 'America/Fort_Nelson', label: 'Fort Nelson' },
    { value: 'America/Fortaleza', label: 'Fortaleza' },
    { value: 'America/Glace_Bay', label: 'Glace Bay' },
    { value: 'America/Godthab', label: 'Godthab' },
    { value: 'America/Goose_Bay', label: 'Goose Bay' },
    { value: 'America/Grand_Turk', label: 'Grand Turk' },
    { value: 'America/Grenada', label: 'Grenada' },
    { value: 'America/Guadeloupe', label: 'Guadeloupe' },
    { value: 'America/Guatemala', label: 'Guatemala' },
    { value: 'America/Guayaquil', label: 'Guayaquil' },
    { value: 'America/Guyana', label: 'Guyana' },
    { value: 'America/Halifax', label: 'Halifax' },
    { value: 'America/Havana', label: 'Havana' },
    { value: 'America/Hermosillo', label: 'Hermosillo' },
    { value: 'America/Indiana/Indianapolis', label: 'Indianapolis' },
    { value: 'America/Indiana/Knox', label: 'Knox' },
    { value: 'America/Indiana/Marengo', label: 'Marengo' },
    { value: 'America/Indiana/Petersburg', label: 'Petersburg' },
    { value: 'America/Indiana/Tell_City', label: 'Tell City' },
    { value: 'America/Indiana/Vevay', label: 'Vevay' },
    { value: 'America/Indiana/Vincennes', label: 'Vincennes' },
    { value: 'America/Indiana/Winamac', label: 'Winamac' },
    { value: 'America/Inuvik', label: 'Inuvik' },
    { value: 'America/Iqaluit', label: 'Iqaluit' },
    { value: 'America/Jamaica', label: 'Jamaica' },
    { value: 'America/Juneau', label: 'Juneau' },
    { value: 'America/Kentucky/Louisville', label: 'Louisville' },
    { value: 'America/Kentucky/Monticello', label: 'Monticello' },
    { value: 'America/Kralendijk', label: 'Kralendijk' },
    { value: 'America/La_Paz', label: 'La Paz' },
    { value: 'America/Lima', label: 'Lima' },
    { value: 'America/Los_Angeles', label: 'Los Angeles' },
    { value: 'America/Lower_Princes', label: 'Lower Princes' },
    { value: 'America/Maceio', label: 'Maceio' },
    { value: 'America/Managua', label: 'Managua' },
    { value: 'America/Manaus', label: 'Manaus' },
    { value: 'America/Marigot', label: 'Marigot' },
    { value: 'America/Martinique', label: 'Martinique' },
    { value: 'America/Matamoros', label: 'Matamoros' },
    { value: 'America/Mazatlan', label: 'Mazatlan' },
    { value: 'America/Menominee', label: 'Menominee' },
    { value: 'America/Merida', label: 'Merida' },
    { value: 'America/Metlakatla', label: 'Metlakatla' },
    { value: 'America/Mexico_City', label: 'Mexico City' },
    { value: 'America/Miquelon', label: 'Miquelon' },
    { value: 'America/Moncton', label: 'Moncton' },
    { value: 'America/Monterrey', label: 'Monterrey' },
    { value: 'America/Montevideo', label: 'Montevideo' },
    { value: 'America/Montserrat', label: 'Montserrat' },
    { value: 'America/Nassau', label: 'Nassau' },
    { value: 'America/New_York', label: 'New York' },
    { value: 'America/Nipigon', label: 'Nipigon' },
    { value: 'America/Nome', label: 'Nome' },
    { value: 'America/Noronha', label: 'Noronha' },
    { value: 'America/North_Dakota/Beulah', label: 'Beulah' },
    { value: 'America/North_Dakota/Center', label: 'Center' },
    { value: 'America/North_Dakota/New_Salem', label: 'New Salem' },
    { value: 'America/Ojinaga', label: 'Ojinaga' },
    { value: 'America/Panama', label: 'Panama' },
    { value: 'America/Pangnirtung', label: 'Pangnirtung' },
    { value: 'America/Paramaribo', label: 'Paramaribo' },
    { value: 'America/Phoenix', label: 'Phoenix' },
    { value: 'America/Port-au-Prince', label: 'Port-au-Prince' },
    { value: 'America/Port_of_Spain', label: 'Port of Spain' },
    { value: 'America/Porto_Velho', label: 'Porto Velho' },
    { value: 'America/Puerto_Rico', label: 'Puerto Rico' },
    { value: 'America/Punta_Arenas', label: 'Punta Arenas' },
    { value: 'America/Rainy_River', label: 'Rainy River' },
    { value: 'America/Rankin_Inlet', label: 'Rankin Inlet' },
    { value: 'America/Recife', label: 'Recife' },
    { value: 'America/Regina', label: 'Regina' },
    { value: 'America/Resolute', label: 'Resolute' },
    { value: 'America/Rio_Branco', label: 'Rio Branco' },
    { value: 'America/Santarem', label: 'Santarem' },
    { value: 'America/Santiago', label: 'Santiago' },
    { value: 'America/Santo_Domingo', label: 'Santo Domingo' },
    { value: 'America/Sao_Paulo', label: 'Sao Paulo' },
    { value: 'America/Scoresbysund', label: 'Scoresbysund' },
    { value: 'America/Sitka', label: 'Sitka' },
    { value: 'America/St_Barthelemy', label: 'St Barthelemy' },
    { value: 'America/St_Johns', label: 'St Johns' },
    { value: 'America/St_Kitts', label: 'St Kitts' },
    { value: 'America/St_Lucia', label: 'St Lucia' },
    { value: 'America/St_Thomas', label: 'St Thomas' },
    { value: 'America/St_Vincent', label: 'St Vincent' },
    { value: 'America/Swift_Current', label: 'Swift Current' },
    { value: 'America/Tegucigalpa', label: 'Tegucigalpa' },
    { value: 'America/Thule', label: 'Thule' },
    { value: 'America/Thunder_Bay', label: 'Thunder Bay' },
    { value: 'America/Tijuana', label: 'Tijuana' },
    { value: 'America/Toronto', label: 'Toronto' },
    { value: 'America/Tortola', label: 'Tortola' },
    { value: 'America/Vancouver', label: 'Vancouver' },
    { value: 'America/Whitehorse', label: 'Whitehorse' },
    { value: 'America/Winnipeg', label: 'Winnipeg' },
    { value: 'America/Yakutat', label: 'Yakutat' },
    { value: 'America/Yellowknife', label: 'Yellowknife' },
    { value: 'Antarctica/Casey', label: 'Casey' },
    { value: 'Antarctica/Davis', label: 'Davis' },
    { value: 'Antarctica/DumontDUrville', label: 'DumontDUrville' },
    { value: 'Antarctica/Macquarie', label: 'Macquarie' },
    { value: 'Antarctica/Mawson', label: 'Mawson' },
    { value: 'Antarctica/McMurdo', label: 'McMurdo' },
    { value: 'Antarctica/Palmer', label: 'Palmer' },
    { value: 'Antarctica/Rothera', label: 'Rothera' },
    { value: 'Antarctica/Syowa', label: 'Syowa' },
    { value: 'Antarctica/Troll', label: 'Troll' },
    { value: 'Antarctica/Vostok', label: 'Vostok' },
    { value: 'Arctic/Longyearbyen', label: 'Longyearbyen' },
    { value: 'Asia/Aden', label: 'Aden' },
    { value: 'Asia/Almaty', label: 'Almaty' },
    { value: 'Asia/Amman', label: 'Amman' },
    { value: 'Asia/Anadyr', label: 'Anadyr' },
    { value: 'Asia/Aqtau', label: 'Aqtau' },
    { value: 'Asia/Aqtobe', label: 'Aqtobe' },
    { value: 'Asia/Ashgabat', label: 'Ashgabat' },
    { value: 'Asia/Atyrau', label: 'Atyrau' },
    { value: 'Asia/Baghdad', label: 'Baghdad' },
    { value: 'Asia/Bahrain', label: 'Bahrain' },
    { value: 'Asia/Baku', label: 'Baku' },
    { value: 'Asia/Bangkok', label: 'Bangkok' },
    { value: 'Asia/Barnaul', label: 'Barnaul' },
    { value: 'Asia/Beirut', label: 'Beirut' },
    { value: 'Asia/Bishkek', label: 'Bishkek' },
    { value: 'Asia/Brunei', label: 'Brunei' },
    { value: 'Asia/Chita', label: 'Chita' },
    { value: 'Asia/Choibalsan', label: 'Choibalsan' },
    { value: 'Asia/Colombo', label: 'Colombo' },
    { value: 'Asia/Damascus', label: 'Damascus' },
    { value: 'Asia/Dhaka', label: 'Dhaka' },
    { value: 'Asia/Dili', label: 'Dili' },
    { value: 'Asia/Dubai', label: 'Dubai' },
    { value: 'Asia/Dushanbe', label: 'Dushanbe' },
    { value: 'Asia/Famagusta', label: 'Famagusta' },
    { value: 'Asia/Gaza', label: 'Gaza' },
    { value: 'Asia/Hebron', label: 'Hebron' },
    { value: 'Asia/Ho_Chi_Minh', label: 'Ho Chi Minh' },
    { value: 'Asia/Hong_Kong', label: 'Hong Kong' },
    { value: 'Asia/Hovd', label: 'Hovd' },
    { value: 'Asia/Irkutsk', label: 'Irkutsk' },
    { value: 'Asia/Jakarta', label: 'Jakarta' },
    { value: 'Asia/Jayapura', label: 'Jayapura' },
    { value: 'Asia/Jerusalem', label: 'Jerusalem' },
    { value: 'Asia/Kabul', label: 'Kabul' },
    { value: 'Asia/Kamchatka', label: 'Kamchatka' },
    { value: 'Asia/Karachi', label: 'Karachi' },
    { value: 'Asia/Kathmandu', label: 'Kathmandu' },
    { value: 'Asia/Khandyga', label: 'Khandyga' },
    { value: 'Asia/Kolkata', label: 'Kolkata' },
    { value: 'Asia/Krasnoyarsk', label: 'Krasnoyarsk' },
    { value: 'Asia/Kuala_Lumpur', label: 'Kuala Lumpur' },
    { value: 'Asia/Kuching', label: 'Kuching' },
    { value: 'Asia/Kuwait', label: 'Kuwait' },
    { value: 'Asia/Macau', label: 'Macau' },
    { value: 'Asia/Magadan', label: 'Magadan' },
    { value: 'Asia/Makassar', label: 'Makassar' },
    { value: 'Asia/Manila', label: 'Manila' },
    { value: 'Asia/Muscat', label: 'Muscat' },
    { value: 'Asia/Nicosia', label: 'Nicosia' },
    { value: 'Asia/Novokuznetsk', label: 'Novokuznetsk' },
    { value: 'Asia/Novosibirsk', label: 'Novosibirsk' },
    { value: 'Asia/Omsk', label: 'Omsk' },
    { value: 'Asia/Oral', label: 'Oral' },
    { value: 'Asia/Phnom_Penh', label: 'Phnom Penh' },
    { value: 'Asia/Pontianak', label: 'Pontianak' },
    { value: 'Asia/Pyongyang', label: 'Pyongyang' },
    { value: 'Asia/Qatar', label: 'Qatar' },
    { value: 'Asia/Qostanay', label: 'Qostanay' },
    { value: 'Asia/Qyzylorda', label: 'Qyzylorda' },
    { value: 'Asia/Riyadh', label: 'Riyadh' },
    { value: 'Asia/Sakhalin', label: 'Sakhalin' },
    { value: 'Asia/Samarkand', label: 'Samarkand' },
    { value: 'Asia/Seoul', label: 'Seoul' },
    { value: 'Asia/Shanghai', label: 'Shanghai' },
    { value: 'Asia/Singapore', label: 'Singapore' },
    { value: 'Asia/Srednekolymsk', label: 'Srednekolymsk' },
    { value: 'Asia/Taipei', label: 'Taipei' },
    { value: 'Asia/Tashkent', label: 'Tashkent' },
    { value: 'Asia/Tbilisi', label: 'Tbilisi' },
    { value: 'Asia/Tehran', label: 'Tehran' },
    { value: 'Asia/Thimphu', label: 'Thimphu' },
    { value: 'Asia/Tokyo', label: 'Tokyo' },
    { value: 'Asia/Tomsk', label: 'Tomsk' },
    { value: 'Asia/Ulaanbaatar', label: 'Ulaanbaatar' },
    { value: 'Asia/Urumqi', label: 'Urumqi' },
    { value: 'Asia/Ust-Nera', label: 'Ust-Nera' },
    { value: 'Asia/Vientiane', label: 'Vientiane' },
    { value: 'Asia/Vladivostok', label: 'Vladivostok' },
    { value: 'Asia/Yakutsk', label: 'Yakutsk' },
    { value: 'Asia/Yangon', label: 'Yangon' },
    { value: 'Asia/Yekaterinburg', label: 'Yekaterinburg' },
    { value: 'Asia/Yerevan', label: 'Yerevan' },
    { value: 'Atlantic/Azores', label: 'Azores' },
    { value: 'Atlantic/Bermuda', label: 'Bermuda' },
    { value: 'Atlantic/Canary', label: 'Canary' },
    { value: 'Atlantic/Cape_Verde', label: 'Cape Verde' },
    { value: 'Atlantic/Faroe', label: 'Faroe' },
    { value: 'Atlantic/Madeira', label: 'Madeira' },
    { value: 'Atlantic/Reykjavik', label: 'Reykjavik' },
    { value: 'Atlantic/South_Georgia', label: 'South Georgia' },
    { value: 'Atlantic/St_Helena', label: 'St Helena' },
    { value: 'Atlantic/Stanley', label: 'Stanley' },
    { value: 'Australia/Adelaide', label: 'Adelaide' },
    { value: 'Australia/Brisbane', label: 'Brisbane' },
    { value: 'Australia/Broken_Hill', label: 'Broken Hill' },
    { value: 'Australia/Currie', label: 'Currie' },
    { value: 'Australia/Darwin', label: 'Darwin' },
    { value: 'Australia/Eucla', label: 'Eucla' },
    { value: 'Australia/Hobart', label: 'Hobart' },
    { value: 'Australia/Lindeman', label: 'Lindeman' },
    { value: 'Australia/Lord_Howe', label: 'Lord Howe' },
    { value: 'Australia/Melbourne', label: 'Melbourne' },
    { value: 'Australia/Perth', label: 'Perth' },
    { value: 'Australia/Sydney', label: 'Sydney' },
    { value: 'Europe/Amsterdam', label: 'Amsterdam' },
    { value: 'Europe/Andorra', label: 'Andorra' },
    { value: 'Europe/Astrakhan', label: 'Astrakhan' },
    { value: 'Europe/Athens', label: 'Athens' },
    { value: 'Europe/Belgrade', label: 'Belgrade' },
    { value: 'Europe/Berlin', label: 'Berlin' },
    { value: 'Europe/Bratislava', label: 'Bratislava' },
    { value: 'Europe/Brussels', label: 'Brussels' },
    { value: 'Europe/Bucharest', label: 'Bucharest' },
    { value: 'Europe/Budapest', label: 'Budapest' },
    { value: 'Europe/Busingen', label: 'Busingen' },
    { value: 'Europe/Chisinau', label: 'Chisinau' },
    { value: 'Europe/Copenhagen', label: 'Copenhagen' },
    { value: 'Europe/Dublin', label: 'Dublin' },
    { value: 'Europe/Gibraltar', label: 'Gibraltar' },
    { value: 'Europe/Guernsey', label: 'Guernsey' },
    { value: 'Europe/Helsinki', label: 'Helsinki' },
    { value: 'Europe/Isle_of_Man', label: 'Isle of Man' },
    { value: 'Europe/Istanbul', label: 'Istanbul' },
    { value: 'Europe/Jersey', label: 'Jersey' },
    { value: 'Europe/Kaliningrad', label: 'Kaliningrad' },
    { value: 'Europe/Kiev', label: 'Kiev' },
    { value: 'Europe/Kirov', label: 'Kirov' },
    { value: 'Europe/Lisbon', label: 'Lisbon' },
    { value: 'Europe/Ljubljana', label: 'Ljubljana' },
    { value: 'Europe/London', label: 'London' },
    { value: 'Europe/Luxembourg', label: 'Luxembourg' },
    { value: 'Europe/Madrid', label: 'Madrid' },
    { value: 'Europe/Malta', label: 'Malta' },
    { value: 'Europe/Mariehamn', label: 'Mariehamn' },
    { value: 'Europe/Minsk', label: 'Minsk' },
    { value: 'Europe/Monaco', label: 'Monaco' },
    { value: 'Europe/Moscow', label: 'Moscow' },
    { value: 'Europe/Oslo', label: 'Oslo' },
    { value: 'Europe/Paris', label: 'Paris' },
    { value: 'Europe/Podgorica', label: 'Podgorica' },
    { value: 'Europe/Prague', label: 'Prague' },
    { value: 'Europe/Riga', label: 'Riga' },
    { value: 'Europe/Rome', label: 'Rome' },
    { value: 'Europe/Samara', label: 'Samara' },
    { value: 'Europe/San_Marino', label: 'San Marino' },
    { value: 'Europe/Sarajevo', label: 'Sarajevo' },
    { value: 'Europe/Saratov', label: 'Saratov' },
    { value: 'Europe/Simferopol', label: 'Simferopol' },
    { value: 'Europe/Skopje', label: 'Skopje' },
    { value: 'Europe/Sofia', label: 'Sofia' },
    { value: 'Europe/Stockholm', label: 'Stockholm' },
    { value: 'Europe/Tallinn', label: 'Tallinn' },
    { value: 'Europe/Tirane', label: 'Tirane' },
    { value: 'Europe/Ulyanovsk', label: 'Ulyanovsk' },
    { value: 'Europe/Uzhgorod', label: 'Uzhgorod' },
    { value: 'Europe/Vaduz', label: 'Vaduz' },
    { value: 'Europe/Vatican', label: 'Vatican' },
    { value: 'Europe/Vienna', label: 'Vienna' },
    { value: 'Europe/Vilnius', label: 'Vilnius' },
    { value: 'Europe/Volgograd', label: 'Volgograd' },
    { value: 'Europe/Warsaw', label: 'Warsaw' },
    { value: 'Europe/Zagreb', label: 'Zagreb' },
    { value: 'Europe/Zaporozhye', label: 'Zaporozhye' },
    { value: 'Europe/Zurich', label: 'Zurich' },
    { value: 'Indian/Antananarivo', label: 'Antananarivo' },
    { value: 'Indian/Chagos', label: 'Chagos' },
    { value: 'Indian/Christmas', label: 'Christmas' },
    { value: 'Indian/Cocos', label: 'Cocos' },
    { value: 'Indian/Comoro', label: 'Comoro' },
    { value: 'Indian/Kerguelen', label: 'Kerguelen' },
    { value: 'Indian/Mahe', label: 'Mahe' },
    { value: 'Indian/Maldives', label: 'Maldives' },
    { value: 'Indian/Mauritius', label: 'Mauritius' },
    { value: 'Indian/Mayotte', label: 'Mayotte' },
    { value: 'Indian/Reunion', label: 'Reunion' },
    { value: 'Pacific/Apia', label: 'Apia' },
    { value: 'Pacific/Auckland', label: 'Auckland' },
    { value: 'Pacific/Bougainville', label: 'Bougainville' },
    { value: 'Pacific/Chatham', label: 'Chatham' },
    { value: 'Pacific/Chuuk', label: 'Chuuk' },
    { value: 'Pacific/Easter', label: 'Easter' },
    { value: 'Pacific/Efate', label: 'Efate' },
    { value: 'Pacific/Enderbury', label: 'Enderbury' },
    { value: 'Pacific/Fakaofo', label: 'Fakaofo' },
    { value: 'Pacific/Fiji', label: 'Fiji' },
    { value: 'Pacific/Funafuti', label: 'Funafuti' },
    { value: 'Pacific/Galapagos', label: 'Galapagos' },
    { value: 'Pacific/Gambier', label: 'Gambier' },
    { value: 'Pacific/Guadalcanal', label: 'Guadalcanal' },
    { value: 'Pacific/Guam', label: 'Guam' },
    { value: 'Pacific/Honolulu', label: 'Honolulu' },
    { value: 'Pacific/Kiritimati', label: 'Kiritimati' },
    { value: 'Pacific/Kosrae', label: 'Kosrae' },
    { value: 'Pacific/Kwajalein', label: 'Kwajalein' },
    { value: 'Pacific/Majuro', label: 'Majuro' },
    { value: 'Pacific/Marquesas', label: 'Marquesas' },
    { value: 'Pacific/Midway', label: 'Midway' },
    { value: 'Pacific/Nauru', label: 'Nauru' },
    { value: 'Pacific/Niue', label: 'Niue' },
    { value: 'Pacific/Norfolk', label: 'Norfolk' },
    { value: 'Pacific/Noumea', label: 'Noumea' },
    { value: 'Pacific/Pago_Pago', label: 'Pago Pago' },
    { value: 'Pacific/Palau', label: 'Palau' },
    { value: 'Pacific/Pitcairn', label: 'Pitcairn' },
    { value: 'Pacific/Pohnpei', label: 'Pohnpei' },
    { value: 'Pacific/Port_Moresby', label: 'Port Moresby' },
    { value: 'Pacific/Rarotonga', label: 'Rarotonga' },
    { value: 'Pacific/Saipan', label: 'Saipan' },
    { value: 'Pacific/Tahiti', label: 'Tahiti' },
    { value: 'Pacific/Tarawa', label: 'Tarawa' },
    { value: 'Pacific/Tongatapu', label: 'Tongatapu' },
    { value: 'Pacific/Wake', label: 'Wake' },
    { value: 'Pacific/Wallis', label: 'Wallis' }
  ];

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (currencyDropdownRef.current && !currencyDropdownRef.current.contains(event.target)) {
        setShowCurrencyDropdown(false);
        setCurrencySearch('');
      }
      if (timezoneDropdownRef.current && !timezoneDropdownRef.current.contains(event.target)) {
        setShowTimezoneDropdown(false);
        setTimezoneSearch('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const userStr = localStorage.getItem('hotel_user');
    if (userStr) {
      const userData = JSON.parse(userStr);
      setUserId(userData.id);
      setUser(userData);
      setProfileForm({
        full_name: userData.full_name || '',
        email: userData.email || '',
        phone: userData.phone || '',
        dob: userData.dob ? userData.dob.split('T')[0] : '',
        country: userData.country || '',
        city: userData.city || '',
        address: userData.address || ''
      });
    }
  }, []);

  useEffect(() => {
    if (userId) {
      fetchSettings();
    }
  }, [userId]);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setSettings(data);
        setSettingsForm({
          name: data.name || '',
          logo: data.logo || '',
          address: data.address || '',
          email: data.email || '',
          phone: data.phone || '',
          fax: data.fax || '',
          footer_text: data.footer_text || '',
          default_currency: data.default_currency || 'USD',
          default_date_format: data.default_date_format || 'MM/DD/YYYY',
          timezone: data.timezone || 'UTC',
          minimum_booking: data.minimum_booking || 1,
          advance_payment: data.advance_payment || 0,
          taxes: data.taxes || 0
        });
        setLogoPreview(data.logo || '');

        if (data.default_currency) {
          localStorage.setItem('hotel_currency', data.default_currency);
        }
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);

      const { data, error } = await supabase
        .from('users')
        .update({
          full_name: profileForm.full_name,
          phone: profileForm.phone,
          dob: profileForm.dob || null,
          country: profileForm.country,
          city: profileForm.city,
          address: profileForm.address,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;

      const updatedUser = { ...user, ...data };
      localStorage.setItem('hotel_user', JSON.stringify(updatedUser));
      setUser(updatedUser);

      showMessage('success', 'Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      showMessage('error', 'Failed to update profile: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (passwordForm.new_password !== passwordForm.confirm_password) {
      showMessage('error', 'New passwords do not match!');
      return;
    }

    if (passwordForm.new_password.length < 6) {
      showMessage('error', 'Password must be at least 6 characters long!');
      return;
    }

    try {
      setSaving(true);

      const { data: userData, error: fetchError } = await supabase
        .from('users')
        .select('password')
        .eq('id', userId)
        .single();

      if (fetchError) throw fetchError;

      if (userData.password !== passwordForm.current_password) {
        showMessage('error', 'Current password is incorrect!');
        setSaving(false);
        return;
      }

      const { error: updateError } = await supabase
        .from('users')
        .update({
          password: passwordForm.new_password,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (updateError) throw updateError;

      setPasswordForm({
        current_password: '',
        new_password: '',
        confirm_password: ''
      });

      showMessage('success', 'Password changed successfully!');
    } catch (error) {
      console.error('Error changing password:', error);
      showMessage('error', 'Failed to change password: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showMessage('error', 'Please select an image file!');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      showMessage('error', 'Image size should be less than 2MB!');
      return;
    }

    setLogoFile(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const uploadLogo = async () => {
    if (!logoFile) return settingsForm.logo;

    try {
      setUploadingLogo(true);

      const fileExt = logoFile.name.split('.').pop();
      const fileName = `logo-${Date.now()}.${fileExt}`;
      const filePath = `logos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('hotel-images')
        .upload(filePath, logoFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('hotel-images')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading logo:', error);
      throw error;
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleSettingsUpdate = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);

      let logoUrl = settingsForm.logo;

      if (logoFile) {
        logoUrl = await uploadLogo();
      }

      const settingsData = {
        user_id: userId,
        name: settingsForm.name,
        logo: logoUrl,
        address: settingsForm.address,
        email: settingsForm.email,
        phone: settingsForm.phone,
        fax: settingsForm.fax,
        footer_text: settingsForm.footer_text,
        default_currency: settingsForm.default_currency,
        default_date_format: settingsForm.default_date_format,
        timezone: settingsForm.timezone,
        minimum_booking: parseInt(settingsForm.minimum_booking),
        advance_payment: parseFloat(settingsForm.advance_payment),
        taxes: parseFloat(settingsForm.taxes)
      };

      let result;
      if (settings?.id) {
        result = await supabase
          .from('settings')
          .update(settingsData)
          .eq('id', settings.id)
          .eq('user_id', userId)
          .select()
          .single();
      } else {
        result = await supabase
          .from('settings')
          .insert([settingsData])
          .select()
          .single();
      }

      if (result.error) throw result.error;

      setSettings(result.data);
      setSettingsForm({ ...settingsForm, logo: logoUrl });
      setLogoFile(null);

      localStorage.setItem('hotel_currency', settingsForm.default_currency);

      // Update cached hotel settings for sidebar instant load
      localStorage.setItem('hotel_settings', JSON.stringify({
        name: settingsForm.name,
        logo: logoUrl
      }));

      showMessage('success', 'Settings updated successfully!');
    } catch (error) {
      console.error('Error updating settings:', error);
      showMessage('error', 'Failed to update settings: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'password', label: 'Security', icon: Lock },
    { id: 'general', label: 'General', icon: Globe },
    { id: 'hotel', label: 'Hotel Info', icon: Building2 }
  ];

  if (loading) {
    return (
      <div className="space-y-3 md:space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="h-6 w-32 bg-neutral-200 rounded animate-pulse"></div>
              <div className="h-4 w-48 bg-neutral-100 rounded animate-pulse mt-1"></div>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-[#F5F3FF] rounded-xl border border-neutral-200 p-3 animate-pulse">
                <div className="h-4 w-16 bg-neutral-100 rounded mb-2"></div>
                <div className="h-6 w-24 bg-neutral-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
    );
  }

  return (
    <div className="space-y-3 md:space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-lg md:text-xl font-semibold tracking-tight text-neutral-900">Settings</h1>
            <p className="text-xs text-neutral-500 mt-0.5">Manage your profile and system preferences</p>
          </div>
        </div>

        {/* Message Alert */}
        {message.text && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-3 rounded-xl flex items-center gap-2 ${
              message.type === 'success'
                ? 'bg-green-50 border border-green-200 text-green-700'
                : 'bg-red-50 border border-red-200 text-red-700'
            }`}
          >
            {message.type === 'success' ? (
              <Check className="w-4 h-4" />
            ) : (
              <AlertCircle className="w-4 h-4" />
            )}
            <span className="text-xs font-medium">{message.text}</span>
          </motion.div>
        )}

        {/* Stats Cards - Current User Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 md:gap-3">
          <div className="bg-[#F5F3FF] rounded-xl border border-neutral-200 p-3">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="text-[10px] md:text-xs text-neutral-500">User</p>
                <p className="text-xs md:text-sm font-semibold text-neutral-900 mt-0.5 break-words">
                  {user?.full_name || 'N/A'}
                </p>
              </div>
              <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-[#472F97] flex items-center justify-center shrink-0">
                <User className="w-3.5 h-3.5 md:w-4 md:h-4 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-[#F5F3FF] rounded-xl border border-neutral-200 p-3">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="text-[10px] md:text-xs text-neutral-500">Email</p>
                <p className="text-xs md:text-sm font-semibold text-neutral-900 mt-0.5 break-all">
                  {user?.email || 'N/A'}
                </p>
              </div>
              <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-[#472F97] flex items-center justify-center shrink-0">
                <Mail className="w-3.5 h-3.5 md:w-4 md:h-4 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-[#F5F3FF] rounded-xl border border-neutral-200 p-3">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="text-[10px] md:text-xs text-neutral-500">Location</p>
                <p className="text-xs md:text-sm font-semibold text-neutral-900 mt-0.5 break-words">
                  {user?.city && user?.country ? `${user.city}, ${user.country}` : user?.country || 'N/A'}
                </p>
              </div>
              <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-[#472F97] flex items-center justify-center shrink-0">
                <MapPin className="w-3.5 h-3.5 md:w-4 md:h-4 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-[#F5F3FF] rounded-xl border border-neutral-200 p-3">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="text-[10px] md:text-xs text-neutral-500">Member Since</p>
                <p className="text-xs md:text-sm font-semibold text-neutral-900 mt-0.5">
                  {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                </p>
              </div>
              <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
                <Calendar className="w-3.5 h-3.5 md:w-4 md:h-4 text-amber-700" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Card */}
        <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
          {/* Tabs */}
          <div className="px-3 md:px-4 py-2 border-b border-neutral-200 bg-neutral-50">
            <div className="flex overflow-x-auto gap-1 scrollbar-thin">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium whitespace-nowrap rounded-lg transition-all duration-200 ${
                      activeTab === tab.id
                        ? 'bg-[#472F97] text-white'
                        : 'text-neutral-600 hover:bg-neutral-200'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-3 md:p-4">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <motion.form
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onSubmit={handleProfileUpdate}
                className="space-y-4"
              >
                {/* Personal Information Section */}
                <div className="bg-neutral-50 rounded-xl border border-neutral-200 p-3 md:p-4">
                  <h3 className="text-xs font-semibold text-neutral-700 mb-3 flex items-center gap-2">
                    <User className="w-3.5 h-3.5" />
                    Personal Information
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-neutral-600 mb-1">Full Name</label>
                      <input
                        type="text"
                        value={profileForm.full_name}
                        onChange={(e) => setProfileForm({ ...profileForm, full_name: e.target.value })}
                        className="w-full px-3 py-2 text-xs border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#472F97] focus:border-transparent bg-white"
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-neutral-600 mb-1">Email Address</label>
                      <input
                        type="email"
                        value={profileForm.email}
                        disabled
                        className="w-full px-3 py-2 text-xs border border-neutral-200 rounded-lg bg-neutral-100 text-neutral-500 cursor-not-allowed"
                        placeholder="Email address"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-neutral-600 mb-1">Phone Number</label>
                      <input
                        type="tel"
                        value={profileForm.phone}
                        onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                        className="w-full px-3 py-2 text-xs border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#472F97] focus:border-transparent bg-white"
                        placeholder="Enter your phone number"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-neutral-600 mb-1">Date of Birth</label>
                      <input
                        type="date"
                        value={profileForm.dob}
                        onChange={(e) => setProfileForm({ ...profileForm, dob: e.target.value })}
                        className="w-full px-3 py-2 text-xs border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#472F97] focus:border-transparent bg-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Address Section */}
                <div className="bg-neutral-50 rounded-xl border border-neutral-200 p-3 md:p-4">
                  <h3 className="text-xs font-semibold text-neutral-700 mb-3 flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5" />
                    Address Details
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-neutral-600 mb-1">Country</label>
                      <input
                        type="text"
                        value={profileForm.country}
                        onChange={(e) => setProfileForm({ ...profileForm, country: e.target.value })}
                        className="w-full px-3 py-2 text-xs border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#472F97] focus:border-transparent bg-white"
                        placeholder="Enter your country"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-neutral-600 mb-1">City</label>
                      <input
                        type="text"
                        value={profileForm.city}
                        onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })}
                        className="w-full px-3 py-2 text-xs border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#472F97] focus:border-transparent bg-white"
                        placeholder="Enter your city"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-medium text-neutral-600 mb-1">Full Address</label>
                      <textarea
                        value={profileForm.address}
                        onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                        rows={2}
                        className="w-full px-3 py-2 text-xs border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#472F97] focus:border-transparent resize-none bg-white"
                        placeholder="Enter your full address"
                      />
                    </div>
                  </div>
                </div>

                {/* Account Info */}
                <div className="bg-neutral-50 rounded-xl border border-neutral-200 p-3 md:p-4">
                  <h3 className="text-xs font-semibold text-neutral-700 mb-3 flex items-center gap-2">
                    <Settings className="w-3.5 h-3.5" />
                    Account Information
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div>
                      <p className="text-[10px] text-neutral-500">User ID</p>
                      <p className="text-xs font-medium text-neutral-700">#{user?.id || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-neutral-500">Created</p>
                      <p className="text-xs font-medium text-neutral-700">
                        {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-neutral-500">Last Updated</p>
                      <p className="text-xs font-medium text-neutral-700">
                        {user?.updated_at ? new Date(user.updated_at).toLocaleDateString() :
                         user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-neutral-500">Status</p>
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-green-100 text-green-700 text-[10px] font-medium">
                        Active
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center justify-center gap-2 bg-[#472F97] hover:bg-[#3a2578] text-white px-4 py-2 rounded-lg text-xs font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? (
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Save className="w-3.5 h-3.5" />
                    )}
                    Save Changes
                  </button>
                </div>
              </motion.form>
            )}

            {/* Password Tab */}
            {activeTab === 'password' && (
              <motion.form
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onSubmit={handlePasswordChange}
                className="space-y-4"
              >
                <div className="bg-neutral-50 rounded-xl border border-neutral-200 p-3 md:p-4">
                  <h3 className="text-xs font-semibold text-neutral-700 mb-3 flex items-center gap-2">
                    <Lock className="w-3.5 h-3.5" />
                    Change Password
                  </h3>
                  <div className="max-w-md space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-neutral-600 mb-1">Current Password</label>
                      <div className="relative">
                        <input
                          type={showPasswords.current ? 'text' : 'password'}
                          value={passwordForm.current_password}
                          onChange={(e) => setPasswordForm({ ...passwordForm, current_password: e.target.value })}
                          className="w-full px-3 py-2 pr-10 text-xs border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#472F97] focus:border-transparent bg-white"
                          placeholder="Enter current password"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                        >
                          {showPasswords.current ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-neutral-600 mb-1">New Password</label>
                      <div className="relative">
                        <input
                          type={showPasswords.new ? 'text' : 'password'}
                          value={passwordForm.new_password}
                          onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                          className="w-full px-3 py-2 pr-10 text-xs border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#472F97] focus:border-transparent bg-white"
                          placeholder="Enter new password"
                          required
                          minLength={6}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                        >
                          {showPasswords.new ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                      <p className="text-[10px] text-neutral-400 mt-1">Minimum 6 characters</p>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-neutral-600 mb-1">Confirm New Password</label>
                      <div className="relative">
                        <input
                          type={showPasswords.confirm ? 'text' : 'password'}
                          value={passwordForm.confirm_password}
                          onChange={(e) => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })}
                          className="w-full px-3 py-2 pr-10 text-xs border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#472F97] focus:border-transparent bg-white"
                          placeholder="Confirm new password"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                        >
                          {showPasswords.confirm ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center justify-center gap-2 bg-[#472F97] hover:bg-[#3a2578] text-white px-4 py-2 rounded-lg text-xs font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? (
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Lock className="w-3.5 h-3.5" />
                    )}
                    Change Password
                  </button>
                </div>
              </motion.form>
            )}

            {/* General Settings Tab */}
            {activeTab === 'general' && (
              <motion.form
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onSubmit={handleSettingsUpdate}
                className="space-y-4"
              >
                {/* Regional Settings */}
                <div className="bg-neutral-50 rounded-xl border border-neutral-200 p-3 md:p-4">
                  <h3 className="text-xs font-semibold text-neutral-700 mb-3 flex items-center gap-2">
                    <Globe className="w-3.5 h-3.5" />
                    Regional Settings
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* Searchable Currency Dropdown */}
                    <div className="relative" ref={currencyDropdownRef}>
                      <label className="block text-xs font-medium text-neutral-600 mb-1">Currency</label>
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => {
                            setShowCurrencyDropdown(!showCurrencyDropdown);
                            setShowTimezoneDropdown(false);
                          }}
                          className="w-full px-3 py-2 text-xs border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#472F97] focus:border-transparent bg-white text-left flex items-center justify-between"
                        >
                          <span>
                            {currencies.find(c => c.code === settingsForm.default_currency)?.symbol}{' '}
                            {currencies.find(c => c.code === settingsForm.default_currency)?.name} ({settingsForm.default_currency})
                          </span>
                          <ChevronDown className={`w-3.5 h-3.5 text-neutral-400 transition-transform ${showCurrencyDropdown ? 'rotate-180' : ''}`} />
                        </button>
                        {showCurrencyDropdown && (
                          <div className="absolute z-50 mt-1 w-full bg-white border border-neutral-200 rounded-lg shadow-lg max-h-60 overflow-hidden">
                            <div className="p-2 border-b border-neutral-100">
                              <div className="relative">
                                <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400" />
                                <input
                                  type="text"
                                  value={currencySearch}
                                  onChange={(e) => setCurrencySearch(e.target.value)}
                                  placeholder="Search currency..."
                                  className="w-full pl-7 pr-3 py-1.5 text-xs border border-neutral-200 rounded-md focus:outline-none focus:ring-1 focus:ring-neutral-400"
                                  onClick={(e) => e.stopPropagation()}
                                />
                              </div>
                            </div>
                            <div className="max-h-44 overflow-y-auto">
                              {currencies
                                .filter(c =>
                                  c.name.toLowerCase().includes(currencySearch.toLowerCase()) ||
                                  c.code.toLowerCase().includes(currencySearch.toLowerCase())
                                )
                                .map((currency) => (
                                  <button
                                    key={currency.code}
                                    type="button"
                                    onClick={() => {
                                      setSettingsForm({ ...settingsForm, default_currency: currency.code });
                                      setShowCurrencyDropdown(false);
                                      setCurrencySearch('');
                                    }}
                                    className={`w-full px-3 py-2 text-xs text-left hover:bg-neutral-50 flex items-center gap-2 ${
                                      settingsForm.default_currency === currency.code ? 'bg-neutral-100 font-medium' : ''
                                    }`}
                                  >
                                    <span className="w-6 text-center">{currency.symbol}</span>
                                    <span>{currency.name}</span>
                                    <span className="text-neutral-400">({currency.code})</span>
                                  </button>
                                ))}
                              {currencies.filter(c =>
                                c.name.toLowerCase().includes(currencySearch.toLowerCase()) ||
                                c.code.toLowerCase().includes(currencySearch.toLowerCase())
                              ).length === 0 && (
                                <div className="px-3 py-2 text-xs text-neutral-400 text-center">No results found</div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-neutral-600 mb-1">Date Format</label>
                      <select
                        value={settingsForm.default_date_format}
                        onChange={(e) => setSettingsForm({ ...settingsForm, default_date_format: e.target.value })}
                        className="w-full px-3 py-2 text-xs border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#472F97] focus:border-transparent bg-white"
                      >
                        {dateFormats.map((format) => (
                          <option key={format.value} value={format.value}>
                            {format.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Searchable Timezone Dropdown */}
                    <div className="relative" ref={timezoneDropdownRef}>
                      <label className="block text-xs font-medium text-neutral-600 mb-1">Timezone</label>
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => {
                            setShowTimezoneDropdown(!showTimezoneDropdown);
                            setShowCurrencyDropdown(false);
                          }}
                          className="w-full px-3 py-2 text-xs border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#472F97] focus:border-transparent bg-white text-left flex items-center justify-between"
                        >
                          <span className="truncate">
                            {timezones.find(t => t.value === settingsForm.timezone)?.label || settingsForm.timezone}
                          </span>
                          <ChevronDown className={`w-3.5 h-3.5 text-neutral-400 transition-transform shrink-0 ${showTimezoneDropdown ? 'rotate-180' : ''}`} />
                        </button>
                        {showTimezoneDropdown && (
                          <div className="absolute z-50 mt-1 w-full bg-white border border-neutral-200 rounded-lg shadow-lg max-h-60 overflow-hidden">
                            <div className="p-2 border-b border-neutral-100">
                              <div className="relative">
                                <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400" />
                                <input
                                  type="text"
                                  value={timezoneSearch}
                                  onChange={(e) => setTimezoneSearch(e.target.value)}
                                  placeholder="Search timezone..."
                                  className="w-full pl-7 pr-3 py-1.5 text-xs border border-neutral-200 rounded-md focus:outline-none focus:ring-1 focus:ring-neutral-400"
                                  onClick={(e) => e.stopPropagation()}
                                />
                              </div>
                            </div>
                            <div className="max-h-44 overflow-y-auto">
                              {timezones
                                .filter(tz =>
                                  tz.label.toLowerCase().includes(timezoneSearch.toLowerCase()) ||
                                  tz.value.toLowerCase().includes(timezoneSearch.toLowerCase())
                                )
                                .map((tz) => (
                                  <button
                                    key={tz.value}
                                    type="button"
                                    onClick={() => {
                                      setSettingsForm({ ...settingsForm, timezone: tz.value });
                                      setShowTimezoneDropdown(false);
                                      setTimezoneSearch('');
                                    }}
                                    className={`w-full px-3 py-2 text-xs text-left hover:bg-neutral-50 ${
                                      settingsForm.timezone === tz.value ? 'bg-neutral-100 font-medium' : ''
                                    }`}
                                  >
                                    {tz.label}
                                  </button>
                                ))}
                              {timezones.filter(tz =>
                                tz.label.toLowerCase().includes(timezoneSearch.toLowerCase()) ||
                                tz.value.toLowerCase().includes(timezoneSearch.toLowerCase())
                              ).length === 0 && (
                                <div className="px-3 py-2 text-xs text-neutral-400 text-center">No results found</div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Booking Settings */}
                <div className="bg-neutral-50 rounded-xl border border-neutral-200 p-3 md:p-4">
                  <h3 className="text-xs font-semibold text-neutral-700 mb-3 flex items-center gap-2">
                    <CreditCard className="w-3.5 h-3.5" />
                    Booking & Payment Settings
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-neutral-600 mb-1">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Min. Booking Days
                        </span>
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={settingsForm.minimum_booking}
                        onChange={(e) => setSettingsForm({ ...settingsForm, minimum_booking: e.target.value })}
                        className="w-full px-3 py-2 text-xs border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#472F97] focus:border-transparent bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-neutral-600 mb-1">
                        <span className="flex items-center gap-1">
                          <Percent className="w-3 h-3" />
                          Advance Payment (%)
                        </span>
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        value={settingsForm.advance_payment}
                        onChange={(e) => setSettingsForm({ ...settingsForm, advance_payment: e.target.value })}
                        className="w-full px-3 py-2 text-xs border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#472F97] focus:border-transparent bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-neutral-600 mb-1">
                        <span className="flex items-center gap-1">
                          <Percent className="w-3 h-3" />
                          Default Tax Rate (%)
                        </span>
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        value={settingsForm.taxes}
                        onChange={(e) => setSettingsForm({ ...settingsForm, taxes: e.target.value })}
                        className="w-full px-3 py-2 text-xs border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#472F97] focus:border-transparent bg-white"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center justify-center gap-2 bg-[#472F97] hover:bg-[#3a2578] text-white px-4 py-2 rounded-lg text-xs font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? (
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Save className="w-3.5 h-3.5" />
                    )}
                    Save Settings
                  </button>
                </div>
              </motion.form>
            )}

            {/* Hotel Info Tab */}
            {activeTab === 'hotel' && (
              <motion.form
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onSubmit={handleSettingsUpdate}
                className="space-y-4"
              >
                {/* Logo Upload */}
                <div className="bg-neutral-50 rounded-xl border border-neutral-200 p-3 md:p-4">
                  <h3 className="text-xs font-semibold text-neutral-700 mb-3 flex items-center gap-2">
                    <ImageIcon className="w-3.5 h-3.5" />
                    Hotel Logo
                  </h3>
                  <div className="flex flex-col sm:flex-row items-start gap-4">
                    <div className="w-24 h-24 border-2 border-dashed border-neutral-300 rounded-xl flex items-center justify-center bg-white overflow-hidden shrink-0">
                      {logoPreview ? (
                        <img src={logoPreview} alt="Logo preview" className="w-full h-full object-contain" />
                      ) : (
                        <ImageIcon className="w-6 h-6 text-neutral-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                        id="logo-upload"
                      />
                      <label
                        htmlFor="logo-upload"
                        className="inline-flex items-center gap-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 px-3 py-1.5 rounded-lg font-medium text-xs cursor-pointer transition-colors"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        Choose File
                      </label>
                      {logoFile && (
                        <div className="mt-2 flex items-center gap-2 text-xs text-neutral-600">
                          <span className="truncate max-w-[150px]">{logoFile.name}</span>
                          <button
                            type="button"
                            onClick={() => {
                              setLogoFile(null);
                              setLogoPreview(settingsForm.logo);
                            }}
                            className="text-red-500 hover:text-red-600"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                      <p className="text-[10px] text-neutral-400 mt-2">
                        Recommended: 200x200px, Max 2MB (PNG, JPG, SVG)
                      </p>
                    </div>
                  </div>
                </div>

                {/* Hotel Details */}
                <div className="bg-neutral-50 rounded-xl border border-neutral-200 p-3 md:p-4">
                  <h3 className="text-xs font-semibold text-neutral-700 mb-3 flex items-center gap-2">
                    <Building2 className="w-3.5 h-3.5" />
                    Hotel Details
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-neutral-600 mb-1">Hotel Name</label>
                      <input
                        type="text"
                        value={settingsForm.name}
                        onChange={(e) => setSettingsForm({ ...settingsForm, name: e.target.value })}
                        className="w-full px-3 py-2 text-xs border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#472F97] focus:border-transparent bg-white"
                        placeholder="Enter hotel name"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-neutral-600 mb-1">Contact Email</label>
                      <input
                        type="email"
                        value={settingsForm.email}
                        onChange={(e) => setSettingsForm({ ...settingsForm, email: e.target.value })}
                        className="w-full px-3 py-2 text-xs border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#472F97] focus:border-transparent bg-white"
                        placeholder="contact@hotel.com"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-neutral-600 mb-1">Phone Number</label>
                      <input
                        type="tel"
                        value={settingsForm.phone}
                        onChange={(e) => setSettingsForm({ ...settingsForm, phone: e.target.value })}
                        className="w-full px-3 py-2 text-xs border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#472F97] focus:border-transparent bg-white"
                        placeholder="+1 234 567 8900"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-neutral-600 mb-1">Fax Number</label>
                      <input
                        type="tel"
                        value={settingsForm.fax}
                        onChange={(e) => setSettingsForm({ ...settingsForm, fax: e.target.value })}
                        className="w-full px-3 py-2 text-xs border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#472F97] focus:border-transparent bg-white"
                        placeholder="+1 234 567 8901"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-medium text-neutral-600 mb-1">Address</label>
                      <textarea
                        value={settingsForm.address}
                        onChange={(e) => setSettingsForm({ ...settingsForm, address: e.target.value })}
                        rows={2}
                        className="w-full px-3 py-2 text-xs border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#472F97] focus:border-transparent resize-none bg-white"
                        placeholder="Enter hotel full address"
                      />
                    </div>
                  </div>
                </div>

                {/* Footer Settings */}
                <div className="bg-neutral-50 rounded-xl border border-neutral-200 p-3 md:p-4">
                  <h3 className="text-xs font-semibold text-neutral-700 mb-3 flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5" />
                    Website Footer
                  </h3>
                  <div>
                    <label className="block text-xs font-medium text-neutral-600 mb-1">Footer Text</label>
                    <textarea
                      value={settingsForm.footer_text}
                      onChange={(e) => setSettingsForm({ ...settingsForm, footer_text: e.target.value })}
                      rows={2}
                      className="w-full px-3 py-2 text-xs border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#472F97] focus:border-transparent resize-none bg-white"
                      placeholder="Copyright text or additional info for website footer"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={saving || uploadingLogo}
                    className="flex items-center justify-center gap-2 bg-[#472F97] hover:bg-[#3a2578] text-white px-4 py-2 rounded-lg text-xs font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving || uploadingLogo ? (
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Save className="w-3.5 h-3.5" />
                    )}
                    {uploadingLogo ? 'Uploading...' : 'Save Settings'}
                  </button>
                </div>
              </motion.form>
            )}
          </div>
        </div>
    </div>
  );
};

export default SettingsPage;
