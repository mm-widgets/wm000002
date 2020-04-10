import React, { useEffect, useMemo, useState } from 'react';
import { StyleProp, StyleSheet, Text, TextStyle, View, ViewStyle } from 'react-native';
import { sprintf } from 'sprintf-js';

type tmType = 'D' | 'H' | 'M' | 'S';

interface IProps {
	/**
	 * 倒计时的截止时间
	 */
	until: number;
	/**
	 * 组件大小
	 */
	size?: number;
	/**
	 * 时间标签样式
	 */
	timeLabelStyle?: StyleProp<TextStyle>;
	/**
	 * 分隔符样式
	 */
	separatorStyle?: StyleProp<TextStyle>;
	/**
	 * 数字样式
	 */
	digitStyle?: StyleProp<ViewStyle>;
	/**
	 * 数字文本样式
	 */
	digitTxtStyle?: StyleProp<TextStyle>;
	/**
	 * 显示的格式[‘D’,’H’,’M’,’S’]
	 */
	timeToShow?: tmType[];
	/**
	 * 文本要在时间标签中显示(如：{ d: ‘天’;h: ‘时’;m: ‘分’;s: ‘秒’; })
	 */
	timeLabels?: {
		d: string;
		h: string;
		m: string;
		s: string;
	};
	/**
	 * 是否显示分隔符
	 */
	showSeparator?: boolean;
	/**
	 * 组件样式
	 */
	style?: StyleProp<ViewStyle>;
	/**
	 * 倒计时结束事件
	 */
	onFinish?(): void;
	/**
	 * 时间改变，注:如果界面到后台之后，事件不触发
	 * @param left 剩余时间
	 */
	onChange?(left: number): void;
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
	timeToShow: ['D', 'H', 'M', 'S'] as tmType[]
};

function now() {
	return parseInt(String(new Date().getTime() / 1000), 10);
}

export default function CountDown(p: IProps) {
	const props = {
		...default_props,
		...p
	};
	const u = useMemo(() => {
		if (props.until > 0) {
			return props.until;
		}
		return now();
	}, [props.until]);
	const [left, setleft] = useState(u - now());
	const { timeToShow, timeLabels, showSeparator } = props;
	const { days, hours, minutes, seconds } = getTimeLeft(left, timeToShow);
	const newTime = sprintf('%02d:%02d:%02d:%02d', days, hours, minutes, seconds).split(':');
	useEffect(() => {
		const timer = setInterval(() => {
			const l = u - now();
			if (l <= 0) {
				if (props.onFinish) {
					props.onFinish();
				}
				if (props.onChange) {
					props.onChange(l);
				}
				setleft(0);
				clearInterval(timer);
			} else {
				if (props.onChange) {
					props.onChange(l);
				}
				setleft(l);
			}
		}, 1000);
		return () => {
			clearInterval(timer);
		};
	}, [u, props]);
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

function getTimeLeft(left: number, timeToShow: string[]) {
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
		obj.days = parseInt((left / 86400).toString(), 10);	// 60* 60 *24
	}
	if (d && h) {
		obj.hours = parseInt((left / 3600).toString(), 10) % 24;	// 60 * 60
	} else if (!d && h) {
		obj.hours = parseInt((left / 3600).toString(), 10);
	}
	if (m && (d || h)) {
		obj.minutes = parseInt((left / 60).toString(), 10) % 60;
	} else if (!(d || h) && m) {
		obj.minutes = parseInt((left / 60).toString(), 10);
	}
	if (s && (d || h || m)) {
		obj.seconds = left % 60;
	} else if (!(d || h || m) && s) {
		obj.seconds = left;
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
