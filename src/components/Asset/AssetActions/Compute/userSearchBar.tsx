import React, {
  useState,
  useEffect,
  ChangeEvent,
  FormEvent,
  KeyboardEvent,
  ReactElement
} from 'react'
import SearchIcon from '@images/search.svg'
import InputElement from '@shared/FormInput/InputElement'
import styles from './userSearchBar.module.css'
import { useRouter } from 'next/router'
import Data from 'content/static_data/doctor-dict.json'
import { addExistingParamsToUrl } from 'src/components/Search/utils'
import Button from '@shared/atoms/Button'
import Dotdotdot from 'react-dotdotdot'
import Caret from '@images/caret.svg'

async function emptySearch() {
  const searchParams = new URLSearchParams(window?.location.href)
  const text = searchParams.get('text')

  if (text !== ('' || undefined || null)) {
    const url = await addExistingParamsToUrl(location, [
      'text',
      'owner',
      'tags'
    ])
    // router.push(`${url}&text=%20`)
  }
}

export default function UserSearchBar({
  placeholder,
  initialValue
}: {
  placeholder?: string
  initialValue?: string
}): ReactElement {
  const router = useRouter()
  const [value, setValue] = useState(initialValue || '')
  const parsed = router.query
  const { text, owner } = parsed

  useEffect(() => {
    ;(text || owner) && setValue((text || owner) as string)
  }, [text, owner])

  //   async function startSearch(e: FormEvent<HTMLButtonElement>) {
  //     e.preventDefault()

  //     if (value === '') setValue(' ')

  //     const urlEncodedValue = encodeURIComponent(value)
  //     const url = await addExistingParamsToUrl(location, [
  //       'text',
  //       'owner',
  //       'tags'
  //     ])
  //     router.push(`${url}&text=${urlEncodedValue}`)
  //   }

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    setValue(e.target.value)
    e.target.value === '' && emptySearch()
  }

  async function handleKeyPress(e: KeyboardEvent<HTMLInputElement>) {
    // if (e.key === 'Enter') {
    //   await startSearch(e)
    // }
  }

  async function handleButtonClick(e: FormEvent<HTMLButtonElement>) {
    e.preventDefault()
    // await startSearch(e)
  }

  return (
    <div>
      <form className={styles.search}>
        <InputElement
          type="search"
          name="search"
          placeholder={placeholder || 'Search users...'}
          value={value}
          onChange={handleChange}
          required
          size="small"
          className={styles.input}
          onKeyPress={handleKeyPress}
        />
        <button onClick={handleButtonClick} className={styles.button}>
          <SearchIcon className={styles.searchIcon} />
        </button>
      </form>

      <div>
        <h3 className={styles.heading}>Grant Access</h3>
        {Data.map((post) => (
          <div className={styles.box} key={post.last_name}>
            {/* <Button
              style="primary"
              type={'submit'}
              className={styles.actionCenter}
            >
              {'test'}
            </Button> */}
            {/* <Dotdotdot clamp={1} tagName="span">
              {'test'}
            </Dotdotdot> */}
            {/* <Button style="text" size="small" className={styles.toggle}>
              {open ? 'Hide' : 'Show'} <Caret />
            </Button> */}
            <input
              id={post.first_name + post.last_name}
              className={styles.checkbox}
              defaultChecked={false}
              type={'checkbox'}
            />
            Dr. {post.first_name} {post.last_name}
          </div>
        ))}
      </div>
    </div>
  )
}
