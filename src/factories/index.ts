import { providers } from 'ethers'
import { Arcade__factory } from './Arcade__factory'
import { ERC20__factory } from './ERC20__factory'
import { ERC20 } from './ERC20'

const arcadeAddress = '0xC4829005c86e3054d0e368a915ebFaf42A3310b6'
const provider = new providers.Web3Provider(window.ethereum as any)
const arcade = Arcade__factory.connect(
	arcadeAddress,
	provider
)

const erc20 = (address: string): ERC20 => {
	return ERC20__factory.connect(address, provider)
}

export {
	arcadeAddress,
	arcade,
	erc20,
	provider
}