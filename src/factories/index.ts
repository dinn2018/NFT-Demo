import { providers } from 'ethers'
import { Arcade__factory } from './Arcade__factory'
import { ERC20__factory } from './ERC20__factory'
import { ERC20 } from './ERC20'

const arcadeAddress = '0x81E3B3de2320005330A77b6f72ae57CC2E7E0B63'
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