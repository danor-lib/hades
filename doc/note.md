NI18N => T('key',{value:123})
	`这是一个~[术语]{{value,value}}，类型是{{value,valueType}}`
		=> Ni18N.formatter(value valueType)
			`这是一个~[术语]~{123}，类型是~{123 <number>}`
			=> Hades ==> Chalk
				> highlight: `这是一个术语下划线[123]白色，类型是[123 <number>]白色`
				> nohighlight: `这是一个术语下划线[123]，类型是[123 <number>]`
~[]
~{}
