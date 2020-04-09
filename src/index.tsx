import React, { useEffect, useState } from 'react';
import { StyleProp, StyleSheet, Text, TextStyle, View, ViewStyle } from 'react-native';
import { sprintf } from 'sprintf-js';

interface IProps {
	until: number;
	size?: number;
	timeLabelStyle?: StyleProp<TextStyle>;
	separatorStyle?: StyleProp<TextStyle>;
	digitStyle?: StyleProp<ViewStyle>;
	digitTxtStyle?: StyleProp<TextStyle>;
	timeToShow?: string[];
	timeLabels?: {
		d: string;
		h: string;
		m: string;
		s: string;
	};
	showSeparator?: boolean;
	style?: StyleProp<ViewStyle>;
	onFinish?(): void;
	onChange?(until: number): void;
}

const default_props = {
	digitStyle: { backgroundColor: '#FAB913' },
	digitTxtStyle: { color: '#000' },
	running: true,
	separatorStyle: { color: '#000' },
	showSeparator: false,
	size: 15,
	timeLabelStyle: { color: '#000' },
	timeLabels: {
		d: 'Days',
		h: 'Hours',
		m: 'Minutes',
		s: 'Seconds'
	},
	timeToShow: ['D', 'H', 'M', 'S']
};

export default function CountDown(p: IProps) {
	const props = {
		...default_props,
		...p
	};
	const [until, setuntil] = useState(props.until);
	const { timeToShow, timeLabels, showSeparator } = props;
	const { days, hours, minutes, seconds } = getTimeLeft(until, timeToShow);
	const newTime = sprintf('%02d:%02d:%02d:%02d', days, hours, minutes, seconds).split(':');
	useEffect(() => {
		const timer = setInterval(() => {
			if (until === 0) {
				if (props.onFinish) {
					props.onFinish();
				}
				if (props.onChange) {
					props.onChange(until);
				}
			} else {
				if (props.onChange) {
					props.onChange(until);
				}
				setuntil(until - 1);
			}
		}, 1000);
		return () => {
			clearInterval(timer);
		};
	}, [until, props]);
	function renderDigit(d: string) {
		const { digitStyle, digitTxtStyle, size } = props;
		return (
			<View style={[
				styles.digitCont,
				digitStyle,
				{ width: size * 2.3, height: size * 2.6 }
			]}>
				<Text style={[
					styles.digitTxt,
					{ fontSize: size, color: 'black' },
					digitTxtStyle
				]}>
					{d}
				</Text>
			</View>
		);
	}
	function renderLabel(label: string) {
		const { timeLabelStyle, size } = props;
		if (label) {
			return (
				<Text style={[
					styles.timeTxt,
					{ fontSize: size / 1.8, color: 'black' },
					timeLabelStyle
				]}>
					{label}
				</Text>
			);
		}
		return null;

	}
	function renderDoubleDigits(label: string, digits: string) {
		return (
			<View style={styles.doubleDigitCont}>
				<View style={styles.timeInnerCont}>
					{renderDigit(digits)}
				</View>
				{renderLabel(label)}
			</View>
		);
	}
	function renderSeparator() {
		const { separatorStyle, size } = props;
		return (
			<View style={{ justifyContent: 'center', alignItems: 'center' }}>
				<Text style={[
					styles.separatorTxt,
					{ fontSize: size * 1.2 },
					separatorStyle
				]}>
					{':'}
				</Text>
			</View>
		);
	}
	return (
		<View style={props.style}>
			{timeToShow.includes('D') ? renderDoubleDigits(timeLabels.d, newTime[0]) : null}
			{showSeparator && timeToShow.includes('D') && timeToShow.includes('H') ? renderSeparator() : null}
			{timeToShow.includes('H') ? renderDoubleDigits(timeLabels.h, newTime[1]) : null}
			{showSeparator && timeToShow.includes('H') && timeToShow.includes('M') ? renderSeparator() : null}
			{timeToShow.includes('M') ? renderDoubleDigits(timeLabels.m, newTime[2]) : null}
			{showSeparator && timeToShow.includes('M') && timeToShow.includes('S') ? renderSeparator() : null}
			{timeToShow.includes('S') ? renderDoubleDigits(timeLabels.s, newTime[3]) : null}
		</View>
	);
}

function getTimeLeft(until: number, timeToShow: string[]) {
	const obj = {
		days: 0,
		hours: 0,
		minutes: 0,
		seconds: 0
	};
	const d = timeToShow.includes('D');
	const h = timeToShow.includes('H');
	const m = timeToShow.includes('M');
	const s = timeToShow.includes('S');
	if (d) {
		obj.days = parseInt((until / 86400).toString(), 10);	// 60* 60 *24
	}
	if (d && h) {
		obj.hours = parseInt((until / 3600).toString(), 10) % 24;	// 60 * 60
	} else if (!d && h) {
		obj.hours = parseInt((until / 3600).toString(), 10);
	}
	if (m && (d || h)) {
		obj.minutes = parseInt((until / 60).toString(), 10) % 60;
	} else if (!(d || h) && m) {
		obj.minutes = parseInt((until / 60).toString(), 10);
	}
	if (s && (d || h || m)) {
		obj.seconds = until % 60;
	} else if (!(d || h || m) && s) {
		obj.seconds = until;
	}
	return obj;
}

const styles = StyleSheet.create({
	digitCont: {
		alignItems: 'center',
		borderRadius: 5,
		justifyContent: 'center',
		marginHorizontal: 2
	},
	digitTxt: {
		color: 'white',
		fontVariant: ['tabular-nums'],
		fontWeight: 'bold'
	},
	doubleDigitCont: {
		alignItems: 'center',
		justifyContent: 'center'
	},
	separatorTxt: {
		backgroundColor: 'transparent',
		fontWeight: 'bold'
	},
	timeCont: {
		flexDirection: 'row',
		justifyContent: 'center'
	},
	timeInnerCont: {
		alignItems: 'center',
		flexDirection: 'row',
		justifyContent: 'center'
	},
	timeTxt: {
		backgroundColor: 'transparent',
		color: 'white',
		marginVertical: 2
	}
});
