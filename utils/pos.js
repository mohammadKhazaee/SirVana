exports.toString = (pos) => {
	if (pos.length === 0 || pos[0] === '') return 'ثبت نشده'
	if (pos.length === 5) return 'همه'
	return pos.join('-')
}

exports.toArray = (pos) => {
	if (pos === 'ثبت نشده') return []
	if (pos === 'همه') return ['1', '2', '3', '4', '5']
	return pos.split('-')
}
