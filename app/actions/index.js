import {
  fetchCustomerProfile,
  fetchCustomerProfileWithErrorRequireField,
  fetchCustomerProfileWithNotFound,
  fetchCustomerProfileWithUnAuthorize,
  fetchCustomerProfileWithTimeout,
  ApplicationError,
  fetchFilm,
  fetchStats,
  fetchGolds,
  fetchUploadImage
} from '../apis'
import imgAvatar from '../../images/no-warp.jpg'

// ======= ALERT ======
export const closeAlertMessage = () => {
  return {
    type: 'CLOSE_REACT_ALERT_MESSAGE'
  }
}

// handleError call || user call
// connect directly to reducer
export const openAlertMessage = (
  typeMessage,
  { message, processInstance = 'Frontend', trxId = `${Date.now()}` },
  time = 0
) => {
  return dispatch => {
    dispatch({
      type: 'OPEN_REACT_ALERT_MESSAGE',
      typeMessage: typeMessage,
      message: message,
      processInstance: processInstance,
      trxId: trxId
    })
    if (time > 0) {
      setTimeout(() => dispatch(closeAlertMessage()), time * 1000)
    }
  }
}

// catch api error call this function
export const handleError = error => {
  return (dispatch, getState) => {
    const loginInfo = getState().loginInfo
    dispatch({
      type: 'MASTERAPP/LOADING/HIDE'
    })
    if (_.has(error, 'fault')) {
      // ordinary error
      _.set(error, 'loginInfo', loginInfo)
      dispatch(openAlertMessage(_.get(error, 'type', 'ERROR'), error))
    } else {
      // unexpected error
      const err = new ApplicationError({
        type: 'ERROR',
        code: '500',
        name: 'Application Error',
        appMessage: error.message,
        debugMessage: error.message,
        serviceMessage: '-',
        trxId: '-',
        context: error
      })
      _.set(err, 'loginInfo', loginInfo)
      dispatch(openAlertMessage('ERROR', err))
    }
  }
}

// ===== ACTIONS =====
export const getGolds = () => {
  return dispatch => {
    fetchGolds()
      .then(response => {
        const message = {
          th: 'ดึงข้อมูลสำเร็จแล้ว',
          en: 'get data information successfully',
          technical: ''
        }
        dispatch(openAlertMessage('SUCCESS', { message: message }, 3))
      })
      .catch(error => {
        dispatch(handleError(error))
      })
  }
}

export const getFilm = filmId => {
  return dispatch => {
    fetchFilm(filmId)
      .then(response => {
        const message = {
          th: 'ดึงข้อมูลสำเร็จแล้ว',
          en: 'get data information successfully',
          technical: ''
        }
        dispatch(openAlertMessage('SUCCESS', { message: message }, 3))
      })
      .catch(error => {
        dispatch(handleError(error))
      })
  }
}

export const getStats = httpCode => {
  return dispatch => {
    fetchStats(httpCode)
      .then(response => {
        const message = {
          th: 'ดึงข้อมูลสำเร็จแล้ว',
          en: 'get data information successfully',
          technical: ''
        }
        dispatch(openAlertMessage('SUCCESS', { message: message }, 3))
      })
      .catch(error => {
        dispatch(handleError(error))
      })
  }
}

export const getStatsWithLoading = httpCode => {
  return dispatch => {
    dispatch(
      openAlertMessage('LOADING', {
        message: { th: '', en: '', technical: '' }
      })
    )
    setTimeout(() => {
      fetchStats(httpCode)
        .then(response => {
          const message = {
            th: 'ดึงข้อมูลสำเร็จแล้ว',
            en: 'get data information successfully',
            technical: ''
          }
          dispatch(openAlertMessage('SUCCESS', { message: message }, 3))
        })
        .catch(error => {
          dispatch(handleError(error))
        })
    }, 2000)
  }
}

export const getCustomerProfile = certificateNumber => {
  return dispatch => {
    fetchCustomerProfile(certificateNumber)
      .then(response => {
        const message = {
          th: 'ดึงข้อมูลลูกค้าสำเร็จแล้ว',
          en: 'get customer information successfully',
          technical: ''
        }
        dispatch(openAlertMessage('SUCCESS', { message: message }, 3))
      })
      .catch(error => {
        dispatch(handleError(error))
      })
  }
}

export const getCustomerProfileWithErrorRequireField = certificateNumber => {
  return dispatch => {
    fetchCustomerProfileWithErrorRequireField(certificateNumber)
      .then(response => {
        console.log(response)
      })
      .catch(error => {
        dispatch(handleError(error))
      })
  }
}

export const getCustomerProfileWithNotFound = certificateNumber => {
  return dispatch => {
    fetchCustomerProfileWithNotFound(certificateNumber)
      .then(response => {
        console.log(response)
      })
      .catch(error => {
        dispatch(handleError(error))
      })
  }
}

export const getCustomerProfileWithUnAuthorize = certificateNumber => {
  return dispatch => {
    fetchCustomerProfileWithUnAuthorize(certificateNumber)
      .then(response => {
        console.log(response)
      })
      .catch(error => {
        dispatch(handleError(error))
      })
  }
}

export const getCustomerProfileWithTimeout = certificateNumber => {
  return dispatch => {
    fetchCustomerProfileWithTimeout(certificateNumber)
      .then(response => {
        console.log(response)
      })
      .catch(error => {
        dispatch(handleError(error))
      })
  }
}

export const getCustomerProfileWithLoading = certificateNumber => {
  return dispatch => {
    dispatch(
      openAlertMessage('LOADING', {
        message: { th: '', en: '', technical: '' }
      })
    )
    fetchCustomerProfile(certificateNumber)
      .then(response => {
        dispatch(closeAlertMessage())
      })
      .catch(error => {
        dispatch(handleError(error))
      })
  }
}

const base64toBlob = (b64Data, contentType, sliceSize) => {
  contentType = contentType || ''
  sliceSize = sliceSize || 512

  var byteCharacters = atob(b64Data) // eslint-disable-line
  var byteArrays = []

  for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    var slice = byteCharacters.slice(offset, offset + sliceSize)

    var byteNumbers = new Array(slice.length)
    for (var i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i)
    }

    var byteArray = new Uint8Array(byteNumbers)

    byteArrays.push(byteArray)
  }

  var blob = new Blob(byteArrays, { type: contentType }) // eslint-disable-line
  return blob
}

export const uploadImagePartner = partnerCode => {
  const img = imgAvatar
  const block = img.split(';')
  const contentType = block[0].split(':')[1]
  const realData = block[1].split(',')[1]

  const formData = {
    partnerCode: '20001145',
    // partnerCode: partnerCode,
    partnerImage: base64toBlob(realData, contentType)
  }
  return async dispatch => {
    try {
      await fetchUploadImage(
        'http://localhost:1337/172.19.216.53:8180/DMSRSTService/upload/dealer/display/image',
        formData
      )
    } catch (error) {
      openAlertMessage(error)
    }
  }
}
