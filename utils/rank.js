exports.giveMedal = (rank) => {
	if (!rank) return undefined
	const strRank = rank.toString()
	switch (strRank) {
		case '0':
			return 'Herald'
		case '14.28':
			return 'Guardian'
		case '28.56':
			return 'Crusader'
		case '42.84':
			return 'Archon'
		case '57.12':
			return 'Legend'
		case '71.4':
			return 'Ancient'
		case '85.68':
			return 'Divine'
		case '99.96':
			return 'Immortal'
		case 'Herald':
		case 'Guardian':
		case 'Crusader':
		case 'Archon':
		case 'Legend':
		case 'Ancient':
		case 'Divine':
		case 'Immortal':
			return strRank
		case '1.Herald':
			return 'Herald'
		case '2.Guardian':
			return 'Guardian'
		case '3.Crusader':
			return 'Crusader'
		case '4.Archon':
			return 'Archon'
		case '5.Legend':
			return 'Legend'
		case '6.Ancient':
			return 'Ancient'
		case '7.Divine':
			return 'Divine'
		case '8.Immortal':
			return 'Immortal'
		default:
			return undefined
	}
}

exports.giveNumberedMedal = (rank) => {
	const medal = this.giveMedal(rank)
	switch (medal) {
		case 'Herald':
			return '1.Herald'
		case 'Guardian':
			return '2.Guardian'
		case 'Crusader':
			return '3.Crusader'
		case 'Archon':
			return '4.Archon'
		case 'Legend':
			return '5.Legend'
		case 'Ancient':
			return '6.Ancient'
		case 'Divine':
			return '7.Divine'
		case 'Immortal':
			return '8.Immortal'
		default:
			return undefined
	}
}

exports.givePercent = (rank) => {
	if (!rank) return undefined
	switch (rank) {
		case '0':
			return '-4%'
		case '14.28':
			return '10.28%'
		case '28.56':
			return '23.56%'
		case '42.84':
			return '36.84%'
		case '57.12':
			return '51.12%'
		case '71.4':
			return '64.4%'
		case '85.68':
			return '77.68%'
		case '99.96':
			return '91%'
		default:
			return undefined
	}
}

exports.giveNumber = (rank) => {
	const numberedMedal = this.giveNumberedMedal(rank)
	switch (numberedMedal) {
		case '1.Herald':
			return 0
		case '2.Guardian':
			return 770
		case '3.Crusader':
			return 1540
		case '4.Archon':
			return 2310
		case '5.Legend':
			return 3080
		case '6.Ancient':
			return 3850
		case '7.Divine':
			return 4620
		case '8.Immortal':
			return 5420
	}
}

exports.numberToMedal = (rank) => {
	if (rank >= 0 && rank < 770) return 'Herald'
	if (rank >= 770 && rank < 1540) return 'Guardian'
	if (rank >= 1540 && rank < 2310) return 'Crusader'
	if (rank >= 2310 && rank < 3080) return 'Archon'
	if (rank >= 3080 && rank < 3850) return 'Legend'
	if (rank >= 3850 && rank < 4620) return 'Ancient'
	if (rank >= 4620 && rank < 5420) return 'Divine'
	if (rank >= 5420) return 'Immortal'
	return undefined
}

exports.isRank = (rank) => {
	if (!rank) return undefined
	switch (rank) {
		case 'Herald':
		case 'Guardian':
		case 'Crusader':
		case 'Archon':
		case 'Legend':
		case 'Ancient':
		case 'Divine':
		case 'Immortal':
		case '1.Herald':
		case '2.Guardian':
		case '3.Crusader':
		case '4.Archon':
		case '5.Legend':
		case '6.Ancient':
		case '7.Divine':
		case '8.Immortal':
		case '0':
		case '14.28':
		case '28.56':
		case '42.84':
		case '57.12':
		case '71.4':
		case '85.68':
		case '99.96':
			return true
		default:
			return false
	}
}
