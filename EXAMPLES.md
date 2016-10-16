Some Examples
=============

### JSON

```json
{
	"thing": "That Other Thing",
	"isThingy": true,
	"any": {
		"are": true,
		"of": [
			{ "isBooped": true },
			{ "isBeeped": true }
		]
	},
	"every": {
		"are": true,
		"of": [
			{ "hasTouched": "dingy" },
			{ "hasTouched": "bloopy" }
		]
	}
}
```

### Yaml

```yaml
thing: That Other Thing
isThingy: true
any:
  are: true
  of:
    - isBooped: true
    - isBeeped: true
every:
  are: true
  of:
    - hasTouched: dingy
    - hasTouched: bloopy
```

### XML

> Note: You'll have to translate your XML into a JS object.

```xml
<condition>
	<thing>That Other Thing</thing>
	<isThingy><true /></isThingy>
	<any>
		<are><true /></are>
		<of>
			<condition>
				<isBooped><true /></isBooped>
			</condition>
			<condition>
				<isBeeped><true /></isBeeped>
			</condition>
		</of>
	</any>
	<every>
		<are><true /></are>
		<of>
			<condition>
				<hasTouched>dingy</hasTouched>
			</condition>
			<condition>
				<hasTouched>bloopy</hasTouched>
			</condition>
		</of>
	</every>
</condition>
```

Another possible XML structure:

```xml
<condition>
	<thing>That Other Thing</thing>
	<isThingy value="true" />
	<any>
		<are value="true" />
		<of>
			<condition>
				<isBooped value="true" />
			</condition>
			<condition>
				<isBeeped value="true" />
			</condition>
		</of>
	</any>
	<every>
		<are value="true" />
		<of>
			<condition>
				<hasTouched value="dingy" />
			</condition>
			<condition>
				<hasTouched value="bloopy" />
			</condition>
		</of>
	</every>
</condition>
```

### Something else?

> Note: You'd need you're own parser for this, obviously.

```
when the thing "The Other Thing"
	is thingy
	and any of (
		it is booped
		it is beeped
	) are True
	and every of (
		it has touched "dingy"
		it has touched "bloopy"
	) are True
```
